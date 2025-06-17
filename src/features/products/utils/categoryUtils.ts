import { Category } from '../types';

export interface CategoryHierarchy {
  id: string;
  name: string;
  description?: string;
  subcategories: Category[];
}

export function organizeCategoriesHierarchy(categories: Category[]): CategoryHierarchy[] {
  // Separar categorías principales de subcategorías
  const parentCategories = categories.filter(cat => !cat.parentCategoryId);
  const subcategories = categories.filter(cat => cat.parentCategoryId);

  // Crear la estructura jerárquica
  return parentCategories.map(parent => ({
    id: parent.id,
    name: parent.name,
    description: parent.description,
    subcategories: subcategories.filter(sub => sub.parentCategoryId === parent.id)
  }));
}

export function getSubcategoriesByParent(parentCategoryId: string, categories: Category[]): Category[] {
  return categories.filter(cat => cat.parentCategoryId === parentCategoryId);
}

export function getCategoryById(categoryId: string, categories: Category[]): Category | undefined {
  return categories.find(cat => cat.id === categoryId);
}

export function isSubcategory(categoryId: string, categories: Category[]): boolean {
  const category = getCategoryById(categoryId, categories);
  return Boolean(category?.parentCategoryId);
}

export function getCategoryFullName(categoryId: string, categories: Category[]): string {
  const category = getCategoryById(categoryId, categories);
  if (!category) return 'Categoría no encontrada';

  if (category.parentCategoryId) {
    const parentCategory = getCategoryById(category.parentCategoryId, categories);
    return parentCategory ? `${parentCategory.name} > ${category.name}` : category.name;
  }

  return category.name;
}
