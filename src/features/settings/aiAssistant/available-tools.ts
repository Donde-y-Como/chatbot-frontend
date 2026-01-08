export const AVAILABLE_TOOLS = [
  {
    id: 'getCurrentDate',
    title: 'Fecha y hora actual',
    description:
      'Permite obtener la fecha y hora actual en la zona horaria de Ciudad de México, útil para contextualizar citas, pedidos o eventos.',
  },
  {
    id: 'getServiceId',
    title: 'Buscar servicio por nombre',
    description:
      'Permite buscar un servicio por su nombre y obtener su identificador interno para poder usarlo en otras operaciones como disponibilidad o citas.',
  },
  {
    id: 'checkAvailability',
    title: 'Verificar disponibilidad',
    description:
      'Permite consultar los horarios disponibles de un servicio específico en una fecha determinada antes de crear una cita.',
  },
  {
    id: 'getServicesInfo',
    title: 'Información de servicios',
    description:
      'Permite consultar todos los servicios disponibles del negocio, incluyendo descripciones, precios y detalles relevantes.',
  },
  {
    id: 'getAppointmentDetails',
    title: 'Consultar detalles de una cita',
    description:
      'Permite obtener información detallada de una cita existente utilizando su identificador.',
  },
  {
    id: 'cancelAppointment',
    title: 'Cancelar cita',
    description:
      'Permite cancelar una cita existente de forma segura utilizando su identificador.',
  },
  {
    id: 'getAvailableEvents',
    title: 'Consultar eventos disponibles',
    description:
      'Permite obtener todos los eventos disponibles del negocio, incluyendo fechas, ocurrencias y precios.',
  },
  {
    id: 'cancelBooking',
    title: 'Cancelar reserva de evento',
    description:
      'Permite cancelar una reserva de evento existente utilizando el identificador de la reserva.',
  },
  {
    id: 'createOrder',
    title: 'Crear pedido',
    description:
      'Permite convertir el carrito de compras actual en un pedido con estado pendiente de pago.',
  },
  {
    id: 'getCart',
    title: 'Consultar carrito',
    description:
      'Permite consultar el contenido actual del carrito de compras del usuario.',
  },
  {
    id: 'updateCartItemQuantity',
    title: 'Actualizar cantidad en carrito',
    description:
      'Permite modificar la cantidad de un producto, servicio o evento existente dentro del carrito de compras.',
  },
  {
    id: 'removeItemFromCart',
    title: 'Eliminar artículo del carrito',
    description:
      'Permite eliminar un artículo específico del carrito de compras.',
  },
  {
    id: 'addItemToCart',
    title: 'Agregar artículo al carrito',
    description:
      'Permite agregar un producto, servicio o evento al carrito de compras con una cantidad determinada.',
  },
  {
    id: 'getProductsWithStock',
    title: 'Consultar productos con stock',
    description:
      'Permite obtener todos los productos activos que cuentan con stock disponible.',
  },
  {
    id: 'getOrderById',
    title: 'Consultar pedido',
    description:
      'Permite obtener la información completa de un pedido utilizando su identificador.',
  },
  {
    id: 'turnOff',
    title: 'Desactivar respuestas automáticas',
    description:
      'Permite desactivar las respuestas automáticas cuando el usuario desea hablar con una persona real.',
  },
  {
    id: 'makeAppointment',
    title: 'Crear cita',
    description:
      'Permite crear una nueva cita asociando servicios, fecha y horario específicos una vez validada la disponibilidad.',
  },
  {
    id: 'findProductBySKUOrName',
    title: 'Buscar producto',
    description:
      'Permite buscar un producto utilizando su SKU o su nombre para obtener su información.',
  },
] as const

export type AvailableToolId = (typeof AVAILABLE_TOOLS)[number]['id']
