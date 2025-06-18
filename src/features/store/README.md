# Sistema de Punto de Venta (POS)

Este es un sistema de punto de venta completo optimizado para PC, laptops y tablets, desarrollado con React, TypeScript, Tailwind CSS y Shadcn UI.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

- **Interfaz de usuario completa** con diseño responsivo
- **Búsqueda en tiempo real** de productos, servicios y eventos
- **Navegación por categorías** (Todos, Productos, Paquetes*, Servicios, Eventos)
- **Sistema de carrito** completamente funcional
- **Integración del selector de cliente** existente
- **Filtros avanzados** por precio, etiquetas, categorías y unidades
- **Gestión de estado** robusta con hooks personalizados
- **Tipado completo** en TypeScript
- **Optimización de rendimiento** con React Query

*Nota: La categoría "Paquetes" está preparada pero marcada como "Próximamente" según los requerimientos.

### 📱 Diseño Responsivo

- **PC/Laptop**: Interfaz optimizada con hover effects y botones de tamaño estándar
- **Tablets**: Botones táctiles más grandes y navegación adaptada
- **Móviles**: Layout responsive que se adapta a pantallas pequeñas

## 📁 Estructura del Proyecto

```
src/features/store/
├── components/           # Componentes de UI
│   ├── SearchBar.tsx    # Barra de búsqueda
│   ├── CategoryTabs.tsx # Navegación por categorías
│   ├── FilterButton.tsx # Botón de filtros
│   ├── ItemGrid.tsx     # Grid de productos/servicios/eventos
│   ├── Cart.tsx         # Carrito lateral
│   └── AdvancedFilters.tsx # Panel de filtros avanzados
├── hooks/               # Hooks personalizados
│   ├── usePOS.ts       # Hook principal que combina toda la funcionalidad
│   ├── usePOSCart.ts   # Gestión del carrito
│   ├── usePOSFilters.ts # Gestión de filtros
│   ├── useGetPOSProducts.ts # Obtener productos
│   ├── useGetPOSServices.ts # Obtener servicios
│   ├── useGetPOSEvents.ts   # Obtener eventos
│   └── useGetPOSAuxiliaryData.ts # Datos auxiliares (tags, categorías, unidades)
├── services/            # Servicios de API
│   └── POSApiService.ts # Servicio principal para comunicación con backend
├── types.ts            # Tipos TypeScript
├── POSSystem.tsx       # Componente principal
└── index.ts            # Exports principales
```

## 🔧 Configuración de Endpoints

El sistema está configurado para conectarse a los siguientes endpoints del backend:

### Productos
```
GET /products/item/ - Obtener todos los productos
```

### Servicios
```
GET /services - Obtener todos los servicios
```

### Eventos
```
GET /events/ - Obtener todos los eventos
```

### Datos Auxiliares para Filtros
```
GET /products/productTags/ - Obtener etiquetas
GET /products/categories/ - Obtener categorías  
GET /products/units/ - Obtener unidades
```

## 💻 Uso del Sistema

### Importación Básica

```tsx
import { POSSystem } from '@/features/store'

function App() {
  return <POSSystem />
}
```

### Uso del Hook Principal

```tsx
import { usePOS } from '@/features/store'

function MyComponent() {
  const {
    // Datos
    products,
    services,
    events,
    auxiliaryData,
    
    // Estado
    isLoading,
    error,
    
    // Carrito
    cart,
    
    // Filtros
    filters,
    filteredItems,
    setSearch,
    setCategory,
    
    // Acciones
    refetchAll
  } = usePOS()

  // Tu lógica aquí...
}
```

### Uso Individual de Hooks

```tsx
import { usePOSCart, usePOSFilters } from '@/features/store'

function CartExample() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleCart,
    formatPrice
  } = usePOSCart()

  // Lógica del carrito...
}
```

## 🎨 Personalización

### Configuración de Impuestos

Para cambiar la tasa de impuestos, modifica la constante en `usePOSCart.ts`:

```typescript
const TAX_RATE = 0.16 // Cambiar según necesidades del negocio
```

### Agregar Nuevos Filtros

1. Actualiza el tipo `POSFilters` en `types.ts`
2. Modifica `usePOSFilters.ts` para incluir la nueva lógica
3. Actualiza `AdvancedFilters.tsx` para la UI

### Personalizar Categorías

Modifica el array `categories` en `CategoryTabs.tsx`:

```typescript
const categories = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PRODUCTOS', label: 'Productos' },
  { value: 'MI_CATEGORIA', label: 'Mi Categoría' }, // Nueva categoría
  // ...
]
```

## 🔄 Gestión de Estado

### React Query

El sistema utiliza React Query para:
- Cache inteligente de datos
- Reintento automático en caso de error
- Sincronización en background
- Optimistic updates

### Estado Local

Los hooks personalizados manejan:
- Estado del carrito
- Filtros activos
- UI state (carrito abierto/cerrado)

## 🛠️ Desarrollo y Extensión

### Agregar Nuevos Tipos de Items

1. Crea el tipo en `types.ts`
2. Agrega función de conversión a `POSItem`
3. Actualiza `usePOSFilters.ts` para incluir el nuevo tipo
4. Modifica `CategoryTabs.tsx` si es necesario

### Conectar con Backend Real

1. Actualiza `POSApiService.ts` con las URLs correctas
2. Ajusta el manejo de errores según tu API
3. Modifica los tipos si la estructura de datos difiere

### Agregar Funcionalidades de Venta

```typescript
// En POSApiService.ts
static async processSale(saleData: SaleData) {
  // Implementar lógica de venta
}

// En usePOSCart.ts
const processSale = useCallback(async () => {
  const saleData = {
    clientId: cart.selectedClientId,
    items: cart.items,
    total: cart.total.amount
  }
  
  await POSApiService.processSale(saleData)
  clearCart()
}, [cart, clearCart])
```

## 📱 Optimizaciones para Dispositivos

### Touch Devices
- Botones con tamaño mínimo de 44px
- Gestos de swipe en el carrito
- Feedback haptic (si está disponible)

### Desktop
- Hover effects avanzados
- Keyboard shortcuts
- Drag and drop (futuro)

## 🐛 Solución de Problemas

### Errores Comunes

1. **Token de autenticación**: Verificar que el token esté en localStorage
2. **CORS**: Configurar correctamente en el backend
3. **Tipos**: Asegurar que los tipos coincidan con la API

### Debug Mode

Para habilitar logs detallados:

```typescript
// En POSApiService.ts
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('API Response:', response)
}
```

## 🚀 Próximas Funcionalidades

- [ ] Implementación de Paquetes
- [ ] Códigos de barras/QR
- [ ] Descuentos y promociones
- [ ] Reportes de ventas
- [ ] Integración con impresoras
- [ ] Modo offline
- [ ] Multi-idioma

## 🤝 Contribución

Para contribuir al sistema:

1. Sigue los patrones de código existentes
2. Mantén el tipado estricto
3. Agrega pruebas para nuevas funcionalidades
4. Documenta cambios importantes

## 📄 Licencia

Este código es parte del proyecto DYC y sigue las políticas de licencia establecidas.