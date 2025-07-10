import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
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
import { IconChecklist, IconMessages, IconPackages, IconUsers } from '@tabler/icons-react'
import { BookUserIcon, CalendarFold, Command, PanelLeft, Receipt, ShoppingBag, Store } from 'lucide-react'
import * as React from 'react'
import { ComponentProps } from 'react'
import { useUnreadChats } from './data/useUnreadChats'
import { SidebarData, NavItem } from './types'
import { useGetUser } from './hooks/useGetUser'

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { data: user } = useGetUser()

  const { count: unreadCount, isLoading } = useUnreadChats();

  const { toggleSidebar } = useSidebar()

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
        items: [
          {
            title: 'Chats',
            url: '/chats',
            badge: isLoading ? '...' : unreadCount?.toString() || '0',
            icon: IconMessages,
          },
          {
            title: 'Citas',
            url: '/citas',
            icon: IconChecklist,
          },
          {
            title: 'Eventos',
            url: '/eventos',
            icon: CalendarFold,
          },
          {
            title: 'Servicios',
            url: '/servicios',
            icon: IconPackages,
          },
          {
            title: 'Empleados',
            url: '/empleados',
            icon: IconUsers,
          },
          {
            title: 'Clientes',
            url: '/clientes',
            icon: BookUserIcon,
          },
          {
            title: 'Productos',
            url: '/products',
            icon: ShoppingBag ,
          },
          {
            title: 'Tienda',
            url: '/orden',
            icon: Store,
          },
          {
            title: 'Paquetes',
            url: '/paquetes',
            icon: IconPackages
          },
          {
            title: 'Historial de Ventas',
            url: '/ventas',
            icon: Receipt 
          }
        ],
      },
    ],
  })

  React.useEffect(() => {
    if (unreadCount !== undefined) {
      setData(prev => {
        // Crear copias superficiales para mantener la inmutabilidad sin perder referencias a componentes
        const newData = { ...prev };
        newData.navGroups = [...prev.navGroups];
        
        // Crear copia del primer grupo de navegación
        newData.navGroups[0] = {
          ...newData.navGroups[0],
          items: [...newData.navGroups[0].items],
        };
        
        // Encontrar el índice del elemento Chats
        const chatItemIndex = newData.navGroups[0].items.findIndex(item => item.title === 'Chats');
        
        // Si se encuentra, actualizar solo ese elemento manteniendo todas sus propiedades
        if (chatItemIndex !== -1) {
          newData.navGroups[0].items[chatItemIndex] = {
            ...newData.navGroups[0].items[chatItemIndex],
            badge: unreadCount.toString(),
          };
        }
        
        return newData;
      });
    }
  }, [unreadCount]);

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
        {user ? <NavUser user={user} /> : <Skeleton className='w-full h-3' />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
