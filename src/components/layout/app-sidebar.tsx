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

  // All possible navigation items (will be filtered by permissions)
  const allNavItems = React.useMemo(() => [
    {
      title: 'Dashboard',
      url: '/' as const,
      icon: Home,
    },
    {
      title: 'Chats',
      url: '/chats' as const,
      badge: isLoading ? '...' : unreadCount?.toString() || '0',
      icon: IconMessages,
    },
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
    {
      title: 'Servicios',
      url: '/servicios' as const,
      icon: WrenchIcon,
    },
    {
      title: 'Empleados',
      url: '/empleados' as const,
      icon: IconUsers,
    },
    {
      title: 'Clientes',
      url: '/clientes' as const,
      icon: BookUserIcon,
    },
    {
      title: 'Productos',
      url: '/productos' as const,
      icon: ShoppingBag,
    },
    {
      title: 'Orden',
      url: '/orden' as const,
      icon: Store,
    },
    {
      title: 'Paquetes',
      url: '/paquetes' as const,
      icon: IconPackages,
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
    {
      title: 'Herramientas',
      url: '/tools' as const,
      icon: Hammer,
    },
  ], [isLoading, unreadCount])

  // Filter items based on user permissions
  const filteredNavItems = React.useMemo(() => {
    return allNavItems.filter(item => hasPermission(item.url))
  }, [allNavItems, hasPermission])

  const [data, setData] = React.useState<SidebarData>({
    teams: [
      {
        name: 'Vende más',
        logo: Command,
        plan: 'Plan',
      },
    ],
    navGroups: [
      {
        title: 'General',
        items: filteredNavItems,
      },
    ],
  })

  // Update sidebar data when filtered items change
  React.useEffect(() => {
    setData(prev => ({
      ...prev,
      navGroups: [
        {
          title: 'General',
          items: filteredNavItems,
        },
      ],
    }))
  }, [filteredNavItems])

  // Update unread count for chats
  React.useEffect(() => {
    if (unreadCount !== undefined) {
      setData((prev) => {
        // Create shallow copies to maintain immutability
        const newData = { ...prev }
        newData.navGroups = [...prev.navGroups]

        // Create copy of the navigation group
        newData.navGroups[0] = {
          ...newData.navGroups[0],
          items: [...newData.navGroups[0].items],
        }

        // Find the Chats item index
        const chatItemIndex = newData.navGroups[0].items.findIndex(
          (item) => item.title === 'Chats'
        )

        // If found, update only that element maintaining all its properties
        if (chatItemIndex !== -1) {
          newData.navGroups[0].items[chatItemIndex] = {
            ...newData.navGroups[0].items[chatItemIndex],
            badge: unreadCount.toString(),
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
        <SidebarGroup>
          <SidebarMenu onClick={toggleSidebar} className='cursor-pointer'>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip='Abrir barra'>
                <div>
                  <Button
                    onClick={toggleSidebar}
                    data-sidebar='trigger'
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                  >
                    <PanelLeft />
                  </Button>
                  <span className=''>Colapsar barra lateral</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user ? <NavUser user={user} business={business} /> : <Skeleton className='w-full h-3' />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
