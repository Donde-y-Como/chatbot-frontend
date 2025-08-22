import * as React from 'react'
import { ComponentProps } from 'react'
import {
  IconChecklist, IconClipboardList,
  IconMessages,
  IconPackages,
  IconUsers,
} from '@tabler/icons-react'
import {
  BookUserIcon,
  CalendarFold,
  Command,
  Hammer,
  Home,
  PanelLeft,
  Receipt,
  ShoppingBag,
  Store,
  WrenchIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { useUnreadChats } from './data/useUnreadChats'
import { useGetUserAndBusiness } from './hooks/useGetUser'
import { SidebarData } from './types'
import { useAuth } from '@/stores/authStore'
import { useGetRoles, getUserPermissions } from '@/hooks/useAuth'
import { getRoutePermissions, hasRoutePermissions } from '@/lib/route-permissions'

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { user, business } = useGetUserAndBusiness()
  const { user: authUser } = useAuth()
  const { data: roles } = useGetRoles()
  const { count: unreadCount, isLoading } = useUnreadChats()
  const { toggleSidebar } = useSidebar()

  // Get user permissions for filtering sidebar items
  const userPermissions = React.useMemo(() => {
    return getUserPermissions(authUser, roles || [])
  }, [authUser, roles])

  // Check if user has permission to access a route
  const hasPermission = React.useCallback((url: string) => {
    const requiredPermissions = getRoutePermissions(url)
    
    // If no permissions required, allow access
    if (requiredPermissions.length === 0) {
      return true
    }

    // Check if user is owner (has wildcard permission)
    const isOwner = userPermissions.includes('*')
    
    return isOwner || hasRoutePermissions(userPermissions, requiredPermissions)
  }, [userPermissions])

  // Organized navigation groups with smart UX/UI grouping
  const navigationGroups = React.useMemo(() => {
    const groups = [
      {
        title: 'Panel Principal',
        items: [
          {
            title: 'Dashboard',
            url: '/' as const,
            icon: Home,
          },
        ]
      },
      {
        title: 'Comunicación',
        items: [
          {
            title: 'Chats',
            url: '/chats' as const,
            badge: isLoading ? '...' : unreadCount?.toString() || '0',
            icon: IconMessages,
          },
        ]
      },
      {
        title: 'Agenda & Eventos',
        items: [
          {
            title: 'Citas',
            url: '/citas' as const,
            icon: IconChecklist,
          },
          {
            title: 'Eventos',
            url: '/eventos' as const,
            icon: CalendarFold,
          },
        ]
      },
      {
        title: 'Clientes & Equipo',
        items: [
          {
            title: 'Clientes',
            url: '/clientes' as const,
            icon: BookUserIcon,
          },
          {
            title: 'Empleados',
            url: '/empleados' as const,
            icon: IconUsers,
          },
        ]
      },
      {
        title: 'Productos & Servicios',
        items: [
          {
            title: 'Servicios',
            url: '/servicios' as const,
            icon: WrenchIcon,
          },
          {
            title: 'Productos',
            url: '/productos' as const,
            icon: ShoppingBag,
          },
          {
            title: 'Paquetes',
            url: '/paquetes' as const,
            icon: IconPackages,
          },
        ]
      },
      {
        title: 'Ventas & Órdenes',
        items: [
          {
            title: 'Punto de Venta',
            url: '/orden' as const,
            icon: Store,
          },
          {
            title: 'Historial de Ventas',
            url: '/ventas' as const,
            icon: Receipt,
          },
          {
            title: 'Historial de Órdenes',
            url: '/orden/historial' as const,
            icon: IconClipboardList,
          },
        ]
      },
      {
        title: 'Herramientas',
        items: [
          {
            title: 'Equipos y Consumibles',
            url: '/tools' as const,
            icon: Hammer,
          },
        ]
      },
    ]

    // Filter groups and items based on permissions
    return groups
      .map(group => ({
        ...group,
        items: group.items.filter(item => hasPermission(item.url))
      }))
      .filter(group => group.items.length > 0) // Remove empty groups
  }, [isLoading, unreadCount, hasPermission])

  const [data, setData] = React.useState<SidebarData>({
    teams: [
      {
        name: 'Vende más',
        logo: Command,
        plan: 'Plan',
      },
    ],
    navGroups: navigationGroups,
  })

  // Update sidebar data when navigation groups change
  React.useEffect(() => {
    setData(prev => ({
      ...prev,
      navGroups: navigationGroups,
    }))
  }, [navigationGroups])

  // Update unread count for chats
  React.useEffect(() => {
    if (unreadCount !== undefined) {
      setData((prev) => {
        // Create shallow copies to maintain immutability
        const newData = { ...prev }
        newData.navGroups = [...prev.navGroups]

        // Find the Communication group (where Chats is located)
        const communicationGroupIndex = newData.navGroups.findIndex(
          (group) => group.title === 'Comunicación'
        )

        if (communicationGroupIndex !== -1) {
          // Create copy of the communication group
          newData.navGroups[communicationGroupIndex] = {
            ...newData.navGroups[communicationGroupIndex],
            items: [...newData.navGroups[communicationGroupIndex].items],
          }

          // Find the Chats item index within the communication group
          const chatItemIndex = newData.navGroups[communicationGroupIndex].items.findIndex(
            (item) => item.title === 'Chats'
          )

          // If found, update only that element maintaining all its properties
          if (chatItemIndex !== -1) {
            newData.navGroups[communicationGroupIndex].items[chatItemIndex] = {
              ...newData.navGroups[communicationGroupIndex].items[chatItemIndex],
              badge: unreadCount.toString(),
            }
          }
        }

        return newData
      })
    }
  }, [unreadCount])

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarContent>
        {data.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {user ? <NavUser user={user} business={business} /> : <Skeleton className='w-full h-3' />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
