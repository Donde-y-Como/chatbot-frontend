export const PERMISSIONS = {
  // Appointments
  APPOINTMENT_CREATE: 'appointment.create',
  APPOINTMENT_READ: 'appointment.read',
  APPOINTMENT_UPDATE: 'appointment.update',
  APPOINTMENT_DELETE: 'appointment.delete',

  // Business
  BUSINESS_READ: 'business.read',
  BUSINESS_UPDATE: 'business.update',

  // Clients
  CLIENT_CREATE: 'client.create',
  CLIENT_READ: 'client.read',
  CLIENT_UPDATE: 'client.update',
  CLIENT_DELETE: 'client.delete',

  // Conversations
  CONVERSATION_CREATE: 'conversation.create',
  CONVERSATION_READ: 'conversation.read',
  CONVERSATION_UPDATE: 'conversation.update',
  CONVERSATION_DELETE: 'conversation.delete',

  // Employees
  EMPLOYEE_CREATE: 'employee.create',
  EMPLOYEE_READ: 'employee.read',
  EMPLOYEE_UPDATE: 'employee.update',
  EMPLOYEE_DELETE: 'employee.delete',

  //Bundles

  BUNDLE_CREATE: 'bundle.create',
  BUNDLE_READ: 'bundle.read',
  BUNDLE_UPDATE: 'bundle.update',
  BUNDLE_DELETE: 'bundle.delete',

  // Consumables
  CONSUMABLE_CREATE: 'consumable.create',
  CONSUMABLE_READ: 'consumable.read',
  CONSUMABLE_UPDATE: 'consumable.update',
  CONSUMABLE_DELETE: 'consumable.delete',

  // Equipment

  EQUIPMENT_CREATE: 'equipment.create',
  EQUIPMENT_READ: 'equipment.read',
  EQUIPMENT_UPDATE: 'equipment.update',
  EQUIPMENT_DELETE: 'equipment.delete',

  // PRODUCT TAGS

  PRODUCT_TAG_CREATE: 'product_tag.create',
  PRODUCT_TAG_READ: 'product_tag.read',
  PRODUCT_TAG_UPDATE: 'product_tag.update',
  PRODUCT_TAG_DELETE: 'product_tag.delete',

  //units
  UNIT_CREATE: 'unit.create',
  UNIT_READ: 'unit.read',
  UNIT_UPDATE: 'unit.update',
  UNIT_DELETE: 'unit.delete',

  // Quick reply
  QUICK_REPLY_CREATE: 'quick_reply.create',
  QUICK_REPLY_READ: 'quick_reply.read',
  QUICK_REPLY_UPDATE: 'quick_reply.update',
  QUICK_REPLY_DELETE: 'quick_reply.delete',

  // Events
  EVENT_CREATE: 'event.create',
  EVENT_READ: 'event.read',
  EVENT_UPDATE: 'event.update',
  EVENT_DELETE: 'event.delete',

  // Orders
  ORDER_CREATE: 'order.create',
  ORDER_READ: 'order.read',
  ORDER_UPDATE: 'order.update',
  ORDER_DELETE: 'order.delete',

  // Products
  PRODUCT_CREATE: 'product.create',
  PRODUCT_READ: 'product.read',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',

  // Cart
  CART_CREATE: 'cart.create',
  CART_READ: 'cart.read',
  CART_UPDATE: 'cart.update',
  CART_DELETE: 'cart.delete',

  // Sales
  SALE_CREATE: 'sale.create',
  SALE_READ: 'sale.read',
  SALE_UPDATE: 'sale.update',
  SALE_DELETE: 'sale.delete',

  // Services
  SERVICE_CREATE: 'service.create',
  SERVICE_READ: 'service.read',
  SERVICE_UPDATE: 'service.update',
  SERVICE_DELETE: 'service.delete',

  // Tags
  TAG_CREATE: 'tag.create',
  TAG_READ: 'tag.read',
  TAG_UPDATE: 'tag.update',
  TAG_DELETE: 'tag.delete',

  // Categories
  CATEGORY_CREATE: 'category.create',
  CATEGORY_READ: 'category.read',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',

  // Receipts
  RECEIPT_CREATE: 'receipt.create',
  RECEIPT_READ: 'receipt.read',
  RECEIPT_UPDATE: 'receipt.update',
  RECEIPT_DELETE: 'receipt.delete',

  // Roles
  ROLE_CREATE: 'role.create',
  ROLE_READ: 'role.read',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',

  //Whatsapp Web

  WHATSAPP_WEB_CONNECT: 'whatsapp_web.connect',
  WHATSAPP_WEB_DISCONNECT: 'whatsapp_web.disconnect',
  WHATSAPP_WEB_STATUS: 'whatsapp_web.status',
  WHATSAPP_WEB_QR: 'whatsapp_web.qr',

  // WhatsApp Business
  WHATSAPP_BUSINESS_READ: 'whatsapp_business.read',
  WHATSAPP_BUSINESS_UPDATE: 'whatsapp_business.update',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// Declarative Permission Dependencies
export const PERMISSION_DEPENDENCIES: Record<Permission, Permission[]> = {
  // Appointments need multiple resources
  [PERMISSIONS.APPOINTMENT_CREATE]: [
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.SERVICE_READ,
    PERMISSIONS.BUSINESS_READ,
    PERMISSIONS.CONSUMABLE_READ,
    PERMISSIONS.EQUIPMENT_READ,
  ],
  [PERMISSIONS.APPOINTMENT_UPDATE]: [
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.SERVICE_READ,
  ],
  [PERMISSIONS.APPOINTMENT_DELETE]: [
    PERMISSIONS.APPOINTMENT_READ,
  ],

  // Orders need products and clients
  [PERMISSIONS.ORDER_CREATE]: [
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.CLIENT_READ,
  ],
  [PERMISSIONS.ORDER_UPDATE]: [
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.CLIENT_READ,
  ],
  [PERMISSIONS.ORDER_DELETE]: [
    PERMISSIONS.ORDER_READ,
  ],

  // Sales need products and clients
  [PERMISSIONS.SALE_CREATE]: [
    PERMISSIONS.SALE_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.CLIENT_READ,
  ],
  [PERMISSIONS.SALE_UPDATE]: [
    PERMISSIONS.SALE_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.CLIENT_READ,
  ],
  [PERMISSIONS.SALE_DELETE]: [
    PERMISSIONS.SALE_READ,
  ],

  // Cart operations need products and clients
  [PERMISSIONS.CART_CREATE]: [
    PERMISSIONS.CART_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.CLIENT_READ,
  ],
  [PERMISSIONS.CART_UPDATE]: [
    PERMISSIONS.CART_READ,
    PERMISSIONS.PRODUCT_READ,
  ],
  [PERMISSIONS.CART_DELETE]: [
    PERMISSIONS.CART_READ,
  ],

  // Events may need employee and client access
  [PERMISSIONS.EVENT_CREATE]: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.CLIENT_READ,
  ],
  [PERMISSIONS.EVENT_UPDATE]: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.EMPLOYEE_READ,
  ],
  [PERMISSIONS.EVENT_DELETE]: [
    PERMISSIONS.EVENT_READ,
  ],

  // Conversations need client access
  [PERMISSIONS.CONVERSATION_CREATE]: [
    PERMISSIONS.CONVERSATION_READ,
    PERMISSIONS.CLIENT_READ,
  ],
  [PERMISSIONS.CONVERSATION_UPDATE]: [
    PERMISSIONS.CONVERSATION_READ,
    PERMISSIONS.CLIENT_READ,
  ],
  [PERMISSIONS.CONVERSATION_DELETE]: [
    PERMISSIONS.CONVERSATION_READ,
  ],

  // Products need categories and tags
  [PERMISSIONS.PRODUCT_CREATE]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.CATEGORY_READ,
    PERMISSIONS.PRODUCT_TAG_READ,
    PERMISSIONS.UNIT_READ,
  ],
  [PERMISSIONS.PRODUCT_UPDATE]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.CATEGORY_READ,
    PERMISSIONS.PRODUCT_TAG_READ,
    PERMISSIONS.UNIT_READ,
  ],
  [PERMISSIONS.PRODUCT_DELETE]: [
    PERMISSIONS.PRODUCT_READ,
  ],

  // Services need categories
  [PERMISSIONS.SERVICE_CREATE]: [
    PERMISSIONS.SERVICE_READ,
    PERMISSIONS.CATEGORY_READ,
  ],
  [PERMISSIONS.SERVICE_UPDATE]: [
    PERMISSIONS.SERVICE_READ,
    PERMISSIONS.CATEGORY_READ,
  ],
  [PERMISSIONS.SERVICE_DELETE]: [
    PERMISSIONS.SERVICE_READ,
  ],

  // Bundles need products and services
  [PERMISSIONS.BUNDLE_CREATE]: [
    PERMISSIONS.BUNDLE_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.SERVICE_READ,
  ],
  [PERMISSIONS.BUNDLE_UPDATE]: [
    PERMISSIONS.BUNDLE_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.SERVICE_READ,
  ],
  [PERMISSIONS.BUNDLE_DELETE]: [
    PERMISSIONS.BUNDLE_READ,
  ],

  // Consumables need units and categories
  [PERMISSIONS.CONSUMABLE_CREATE]: [
    PERMISSIONS.CONSUMABLE_READ,
    PERMISSIONS.UNIT_READ,
    PERMISSIONS.CATEGORY_READ,
  ],
  [PERMISSIONS.CONSUMABLE_UPDATE]: [
    PERMISSIONS.CONSUMABLE_READ,
    PERMISSIONS.UNIT_READ,
    PERMISSIONS.CATEGORY_READ,
  ],
  [PERMISSIONS.CONSUMABLE_DELETE]: [
    PERMISSIONS.CONSUMABLE_READ,
  ],

  // Equipment may need categories
  [PERMISSIONS.EQUIPMENT_CREATE]: [
    PERMISSIONS.EQUIPMENT_READ,
    PERMISSIONS.CATEGORY_READ,
  ],
  [PERMISSIONS.EQUIPMENT_UPDATE]: [
    PERMISSIONS.EQUIPMENT_READ,
    PERMISSIONS.CATEGORY_READ,
  ],
  [PERMISSIONS.EQUIPMENT_DELETE]: [
    PERMISSIONS.EQUIPMENT_READ,
  ],

  // Receipts need sales/orders
  [PERMISSIONS.RECEIPT_CREATE]: [
    PERMISSIONS.RECEIPT_READ,
    PERMISSIONS.SALE_READ,
    PERMISSIONS.ORDER_READ,
  ],
  [PERMISSIONS.RECEIPT_UPDATE]: [
    PERMISSIONS.RECEIPT_READ,
    PERMISSIONS.SALE_READ,
    PERMISSIONS.ORDER_READ,
  ],
  [PERMISSIONS.RECEIPT_DELETE]: [
    PERMISSIONS.RECEIPT_READ,
  ],

  // Employees need roles
  [PERMISSIONS.EMPLOYEE_CREATE]: [
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.ROLE_READ,
  ],
  [PERMISSIONS.EMPLOYEE_UPDATE]: [
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.ROLE_READ,
  ],
  [PERMISSIONS.EMPLOYEE_DELETE]: [
    PERMISSIONS.EMPLOYEE_READ,
  ],

  // Quick replies need conversations
  [PERMISSIONS.QUICK_REPLY_CREATE]: [
    PERMISSIONS.QUICK_REPLY_READ,
    PERMISSIONS.CONVERSATION_READ,
  ],
  [PERMISSIONS.QUICK_REPLY_UPDATE]: [
    PERMISSIONS.QUICK_REPLY_READ,
    PERMISSIONS.CONVERSATION_READ,
  ],
  [PERMISSIONS.QUICK_REPLY_DELETE]: [
    PERMISSIONS.QUICK_REPLY_READ,
  ],

  // WhatsApp Business needs WhatsApp Web access
  [PERMISSIONS.WHATSAPP_BUSINESS_UPDATE]: [
    PERMISSIONS.WHATSAPP_BUSINESS_READ,
    PERMISSIONS.WHATSAPP_WEB_STATUS,
  ],

  // WhatsApp Web QR needs connect permission
  [PERMISSIONS.WHATSAPP_WEB_QR]: [
    PERMISSIONS.WHATSAPP_WEB_STATUS,
    PERMISSIONS.WHATSAPP_WEB_CONNECT,
  ],

  // WhatsApp Web disconnect needs connect permission
  [PERMISSIONS.WHATSAPP_WEB_DISCONNECT]: [
    PERMISSIONS.WHATSAPP_WEB_STATUS,
    PERMISSIONS.WHATSAPP_WEB_CONNECT,
  ],

  // Basic CRUD dependencies (create/update/delete require read)
  [PERMISSIONS.CLIENT_CREATE]: [PERMISSIONS.CLIENT_READ],
  [PERMISSIONS.CLIENT_UPDATE]: [PERMISSIONS.CLIENT_READ],
  [PERMISSIONS.CLIENT_DELETE]: [PERMISSIONS.CLIENT_READ],

  [PERMISSIONS.BUSINESS_UPDATE]: [PERMISSIONS.BUSINESS_READ],

  [PERMISSIONS.TAG_CREATE]: [PERMISSIONS.TAG_READ],
  [PERMISSIONS.TAG_UPDATE]: [PERMISSIONS.TAG_READ],
  [PERMISSIONS.TAG_DELETE]: [PERMISSIONS.TAG_READ],

  [PERMISSIONS.CATEGORY_CREATE]: [PERMISSIONS.CATEGORY_READ],
  [PERMISSIONS.CATEGORY_UPDATE]: [PERMISSIONS.CATEGORY_READ],
  [PERMISSIONS.CATEGORY_DELETE]: [PERMISSIONS.CATEGORY_READ],

  [PERMISSIONS.PRODUCT_TAG_CREATE]: [PERMISSIONS.PRODUCT_TAG_READ],
  [PERMISSIONS.PRODUCT_TAG_UPDATE]: [PERMISSIONS.PRODUCT_TAG_READ],
  [PERMISSIONS.PRODUCT_TAG_DELETE]: [PERMISSIONS.PRODUCT_TAG_READ],

  [PERMISSIONS.UNIT_CREATE]: [PERMISSIONS.UNIT_READ],
  [PERMISSIONS.UNIT_UPDATE]: [PERMISSIONS.UNIT_READ],
  [PERMISSIONS.UNIT_DELETE]: [PERMISSIONS.UNIT_READ],

  [PERMISSIONS.ROLE_CREATE]: [PERMISSIONS.ROLE_READ],
  [PERMISSIONS.ROLE_UPDATE]: [PERMISSIONS.ROLE_READ],
  [PERMISSIONS.ROLE_DELETE]: [PERMISSIONS.ROLE_READ],

  // Read permissions and standalone permissions don't need dependencies
  [PERMISSIONS.APPOINTMENT_READ]: [
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.CONSUMABLE_READ,
    PERMISSIONS.EQUIPMENT_READ,
    PERMISSIONS.SERVICE_READ
  ],
  [PERMISSIONS.BUSINESS_READ]: [],
  [PERMISSIONS.CLIENT_READ]: [],
  [PERMISSIONS.CONVERSATION_READ]: [],
  [PERMISSIONS.EMPLOYEE_READ]: [],
  [PERMISSIONS.BUNDLE_READ]: [],
  [PERMISSIONS.CONSUMABLE_READ]: [],
  [PERMISSIONS.EQUIPMENT_READ]: [],
  [PERMISSIONS.PRODUCT_TAG_READ]: [],
  [PERMISSIONS.UNIT_READ]: [],
  [PERMISSIONS.QUICK_REPLY_READ]: [],
  [PERMISSIONS.EVENT_READ]: [],
  [PERMISSIONS.ORDER_READ]: [],
  [PERMISSIONS.PRODUCT_READ]: [],
  [PERMISSIONS.CART_READ]: [],
  [PERMISSIONS.SALE_READ]: [],
  [PERMISSIONS.SERVICE_READ]: [],
  [PERMISSIONS.TAG_READ]: [],
  [PERMISSIONS.CATEGORY_READ]: [],
  [PERMISSIONS.RECEIPT_READ]: [],
  [PERMISSIONS.ROLE_READ]: [],
  [PERMISSIONS.WHATSAPP_WEB_CONNECT]: [],
  [PERMISSIONS.WHATSAPP_WEB_STATUS]: [],
  [PERMISSIONS.WHATSAPP_BUSINESS_READ]: [],
}

/**
 * Get direct dependencies for a specific permission (non-recursive)
 *
 * @param permission - The permission to get dependencies for
 * @returns Array of direct dependencies
 */
export function getDirectDependencies(permission: Permission): Permission[] {
  return PERMISSION_DEPENDENCIES[permission] || []
}

/**
 * Check if removing a permission would break dependencies of other selected permissions
 *
 * @param permissionToRemove - Permission to check for removal
 * @param currentPermissions - Currently selected permissions
 * @returns Object with canRemove flag and list of permissions that would be affected
 */
export function canRemovePermission(
  permissionToRemove: Permission,
  currentPermissions: Permission[]
): {
  canRemove: boolean
  dependentPermissions: Permission[]
} {
  const withoutPermission = currentPermissions.filter(p => p !== permissionToRemove)
  const resolvedWithoutPermission = addPermissionsRelated(withoutPermission)

  // If the permission is still in resolved list, other permissions need it
  const canRemove = !resolvedWithoutPermission.includes(permissionToRemove)

  // Find which permissions depend on this one
  const dependentPermissions = currentPermissions.filter(permission => {
    const dependencies = getDirectDependencies(permission)
    return dependencies.includes(permissionToRemove)
  })

  return {
    canRemove,
    dependentPermissions
  }
}

/**
 * Get all permissions that would be added automatically if the given permissions were selected
 *
 * @param manualPermissions - Permissions that were manually selected
 * @returns Array of permissions that would be auto-added due to dependencies
 */
export function getAutoAddedPermissions(manualPermissions: Permission[]): Permission[] {
  const resolved = addPermissionsRelated(manualPermissions)
  const manual = new Set(manualPermissions)
  return resolved.filter(p => !manual.has(p))
}

// Example usage and testing
export function testPermissionDependencies() {
  console.log('Testing permission dependencies...')

  // Test appointment creation
  const appointmentPermissions = addPermissionsRelated([PERMISSIONS.APPOINTMENT_CREATE])
  console.log('Appointment create permissions:', appointmentPermissions)

  // Test order creation
  const orderPermissions = addPermissionsRelated([PERMISSIONS.ORDER_CREATE])
  console.log('Order create permissions:', orderPermissions)

  // Test multiple permissions
  const multiplePermissions = addPermissionsRelated([
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.CLIENT_UPDATE
  ])
  console.log('Multiple permissions resolved:', multiplePermissions)

  // Test can remove permission
  const canRemove = canRemovePermission(
    PERMISSIONS.CLIENT_READ,
    [PERMISSIONS.APPOINTMENT_CREATE, PERMISSIONS.CLIENT_READ]
  )
  console.log('Can remove CLIENT_READ:', canRemove)
}

/**
 * Adds all related/dependent permissions to the given list of permissions.
 * Uses recursive resolution to ensure all nested dependencies are included.
 *
 * @param permissions - Array of permissions to resolve dependencies for
 * @returns Array of permissions including all dependencies
 */
export function addPermissionsRelated(permissions: Permission[]): Permission[] {
  const result = new Set<Permission>(permissions)
  const toProcess = [...permissions]

  // Process permissions until no more dependencies are found
  while (toProcess.length > 0) {
    const permission = toProcess.pop()!
    const dependencies = PERMISSION_DEPENDENCIES[permission] || []

    // Add each dependency if not already included
    for (const dependency of dependencies) {
      if (!result.has(dependency)) {
        result.add(dependency)
        toProcess.push(dependency) // Process dependencies of this dependency
      }
    }
  }

  return Array.from(result)
}