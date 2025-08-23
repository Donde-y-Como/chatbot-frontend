import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Calendar,
  CalendarPlus,
  DollarSign,
  MessageSquare,
  Package,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import { useAuth } from '@/stores/authStore'
import { getRelativeTime, parseRelativeTime } from '@/lib/utils.ts'
import {
  getUserPermissions,
  useGetMyBusiness,
  useGetRoles,
} from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetAppointments } from '@/features/appointments/hooks/useGetAppointments'
import { useGetClients } from '@/features/clients/hooks/useGetClients'
import { useGetOrdersForStats } from '@/features/orders/hooks'
import { useGetSalesForStats } from '@/features/sales/hooks'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: business } = useGetMyBusiness()
  const { data: roles = [] } = useGetRoles()
  // Get current date for appointments
  const today = new Date().toISOString().split('T')[0]

  // Fetch real data
  const { data: clients, isLoading: clientsLoading } = useGetClients()
  const { data: appointments, isLoading: appointmentsLoading } =
    useGetAppointments(today)
  const { data: orders, isLoading: ordersLoading } = useGetOrdersForStats()
  const { data: sales, isLoading: salesLoading } = useGetSalesForStats()

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalClients = clients?.length || 0
    const todayAppointments = appointments?.length || 0
    const pendingOrders =
      orders?.data.filter((order) => order.status === 'pending')?.length || 0

    // Calculate month revenue from sales
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthRevenue =
      sales?.data
        .filter((sale) => {
          const saleDate = new Date(sale.createdAt)
          return (
            saleDate.getMonth() === currentMonth &&
            saleDate.getFullYear() === currentYear
          )
        })
        ?.reduce((total, sale) => total + (sale.totalAmount.amount || 0), 0) ||
      0

    return [
      {
        title: 'Total Clientes',
        value: clientsLoading ? '...' : totalClients.toLocaleString(),
        description: 'Clientes registrados',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        isLoading: clientsLoading,
      },
      {
        title: 'Citas Hoy',
        value: appointmentsLoading ? '...' : todayAppointments.toString(),
        description: 'Citas programadas para hoy',
        icon: Calendar,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        isLoading: appointmentsLoading,
      },
      {
        title: 'Órdenes Pendientes',
        value: ordersLoading ? '...' : pendingOrders.toString(),
        description: 'Órdenes por procesar',
        icon: ShoppingCart,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        isLoading: ordersLoading,
      },
      {
        title: 'Ingresos del Mes',
        value: salesLoading
          ? '...'
          : `$${monthRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        description: 'Ventas del mes actual',
        icon: DollarSign,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        isLoading: salesLoading,
      },
    ]
  }, [
    clients,
    appointments,
    orders,
    sales,
    clientsLoading,
    appointmentsLoading,
    ordersLoading,
    salesLoading,
  ])

  const userPermissions = getUserPermissions(user, roles)

  const quickActions = [
    {
      title: 'Nueva Cita',
      description: 'Programar una nueva cita',
      icon: CalendarPlus,
      href: '/citas',
      color: 'bg-blue-600 hover:bg-blue-700',
      permission: 'appointment.create',
    },
    {
      title: 'Nuevo Cliente',
      description: 'Registrar un nuevo cliente',
      icon: UserPlus,
      href: '/clientes',
      color: 'bg-green-600 hover:bg-green-700',
      permission: 'client.create',
    },
    {
      title: 'Chat WhatsApp',
      description: 'Ver conversaciones',
      icon: MessageSquare,
      href: '/chats',
      color: 'bg-emerald-600 hover:bg-emerald-700',
      permission: 'conversation.read',
    },
    {
      title: 'Gestionar Servicios',
      description: 'Configurar servicios',
      icon: Package,
      href: '/servicios',
      color: 'bg-purple-600 hover:bg-purple-700',
      permission: 'service.read',
    },
  ].filter(
    (action) => userPermissions.includes(action.permission) || user?.isOwner
  )

  // Generate recent activity from real data
  const recentActivity = useMemo(() => {
    const activities: Array<{
      action: string
      client: string
      time: string
      type: 'appointment' | 'message' | 'payment' | 'client'
    }> = []

    // Add recent appointments (last 5)
    if (appointments && appointments.length > 0) {
      const recentAppointments = appointments
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.date).getTime() -
            new Date(a.createdAt || a.date).getTime()
        )
        .slice(0, 3)

      recentAppointments.forEach((appointment) => {
        activities.push({
          action: 'Nueva cita programada',
          client: appointment.clientName || 'Cliente',
          time: getRelativeTime(appointment.createdAt || appointment.date),
          type: 'appointment',
        })
      })
    }

    // Add recent sales (last 3)
    if (sales && sales.data.length > 0) {
      const recentSales = sales.data
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 2)

      recentSales.forEach((sale) => {
        activities.push({
          action: 'Pago completado',
          client: sale.clientId || 'Cliente',
          time: getRelativeTime(sale.createdAt),
          type: 'payment',
        })
      })
    }

    // Add recent clients (last 2)
    if (clients && clients.length > 0) {
      const recentClients = clients
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 2)

      recentClients.forEach((client) => {
        activities.push({
          action: 'Cliente registrado',
          client: `${client.name}`,
          time: getRelativeTime(client.createdAt),
          type: 'client',
        })
      })
    }

    // Sort all activities by most recent and limit to 4
    return activities
      .sort((a, b) => {
        const timeA = parseRelativeTime(a.time)
        const timeB = parseRelativeTime(b.time)
        return timeA - timeB
      })
      .slice(0, 4)
  }, [appointments, sales, clients])

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <div className='flex gap-2 items-center'>
          <SidebarTrigger variant='outline' className='' />
          <Separator orientation='vertical' className='h-7 ' />
          <h1 className='text-3xl font-bold tracking-tight'>
            ¡Hola, {user?.email?.split('@')[0] || 'Usuario'}! 👋
          </h1>
        </div>
        <p className='text-muted-foreground'>
          Bienvenido a {business?.name || 'tu negocio'}. Aquí tienes un resumen
          de tu actividad.
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {stat.isLoading ? (
                  <div className='space-y-2'>
                    <Skeleton className='h-8 w-16' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>{stat.value}</div>
                    <p className='text-xs text-muted-foreground'>
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Quick Actions */}

        {quickActions.length > 0 && (
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Accesos directos a las funciones más utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-2'>
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.title} to={action.href}>
                      <Button
                        variant='outline'
                        className='h-auto w-full p-4 justify-start'
                      >
                        <div className={`p-2 rounded-md ${action.color} mr-3`}>
                          <Icon className='h-4 w-4 text-white' />
                        </div>
                        <div className='text-left'>
                          <div className='font-medium'>{action.title}</div>
                          <div className='text-sm text-muted-foreground'>
                            {action.description}
                          </div>
                        </div>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en tu negocio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {clientsLoading || appointmentsLoading || salesLoading ? (
                // Loading skeleton for recent activity
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className='flex items-start space-x-3'>
                    <Skeleton className='h-5 w-5 rounded-full' />
                    <div className='flex-1 space-y-1'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-24' />
                      <Skeleton className='h-3 w-16' />
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className='flex items-start space-x-3'>
                    <div
                      className={`p-1 rounded-full ${
                        activity.type === 'appointment'
                          ? 'bg-blue-100'
                          : activity.type === 'message'
                            ? 'bg-green-100'
                            : activity.type === 'payment'
                              ? 'bg-emerald-100'
                              : 'bg-purple-100'
                      }`}
                    >
                      {activity.type === 'appointment' && (
                        <Calendar className='h-3 w-3 text-blue-600' />
                      )}
                      {activity.type === 'message' && (
                        <MessageSquare className='h-3 w-3 text-green-600' />
                      )}
                      {activity.type === 'payment' && (
                        <DollarSign className='h-3 w-3 text-emerald-600' />
                      )}
                      {activity.type === 'client' && (
                        <Users className='h-3 w-3 text-purple-600' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900'>
                        {activity.action}
                      </p>
                      <p className='text-sm text-gray-500'>{activity.client}</p>
                      <p className='text-xs text-gray-400'>{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-4 text-muted-foreground'>
                  <p>No hay actividad reciente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
