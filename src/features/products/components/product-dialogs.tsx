import { ProductActionDialog } from './product-action-dialog';
import { ProductViewDialog } from './product-view-dialog';
import { ProductDeleteDialog } from './product-delete-dialog';

export function ProductDialogs() {
  return (
    <>
      <ProductActionDialog />
      <ProductViewDialog />
      <ProductDeleteDialog />
    </>
  );
}
