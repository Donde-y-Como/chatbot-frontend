/**
 * Route permissions configuration
 * Maps routes to required permissions for access control
 */
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Dashboard/Home
  '/': [],
  '/dashboard': [],

  // Chats/Conversations
  '/chats': ['conversation.read'],

  // Appointments
  '/citas': ['appointment.read'],

  // Clients
  '/clientes': ['client.read'],

  // Employees
  '/empleados': ['employee.read'],

  // Events
  '/eventos': ['event.read'],

  // Orders
  '/orden': ['order.read'],
  '/orden/historial': ['order.read'],

  // Packages
  '/paquetes': ['bundle.read'],

  // Products
  '/productos': ['product.read'],

  // Services
  '/servicios': ['service.read'],

  // Sales
  '/ventas': ['sale.read'],

  // Tools
  '/tools': ['equipment.read'],

  // Settings - All settings require admin access or specific permissions
  '/settings': ['business.read'],
  '/settings/account': ['business.read'],
  '/settings/categories': ['category.read'],
  '/settings/quick-responses': ['quick_reply.read'],
  '/settings/roles': ['role.read'],
  '/settings/tags': ['product_tag.read'],
  '/settings/units': ['unit.read'],
  '/settings/whatsapp': ['whatsapp_web.status'],
} as const

/**
 * Get required permissions for a given route
 */
export function getRoutePermissions(pathname: string): string[] {
  // Try exact match first
  if (pathname in ROUTE_PERMISSIONS) {
    return ROUTE_PERMISSIONS[pathname]
  }

  // Try to match parent routes for nested paths
  const segments = pathname.split('/').filter(Boolean)
  
  // Build potential parent paths
  const potentialPaths = segments.reduce<string[]>((acc, segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    acc.push(path)
    return acc
  }, [])

  // Check from most specific to least specific
  for (let i = potentialPaths.length - 1; i >= 0; i--) {
    const path = potentialPaths[i]
    if (path in ROUTE_PERMISSIONS) {
      return ROUTE_PERMISSIONS[path]
    }
  }

  // Default to no permissions required if route not found
  return []
}

/**
 * Check if user has all required permissions for a route
 */
export function hasRoutePermissions(
  userPermissions: string[],
  routePermissions: string[]
): boolean {
  // If no permissions required, allow access
  if (routePermissions.length === 0) {
    return true
  }

  // Check if user has all required permissions
  return routePermissions.every(permission => 
    userPermissions.includes(permission)
  )
}