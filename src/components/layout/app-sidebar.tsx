import * as React from 'react'
import { ComponentProps } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PanelLeft } from 'lucide-react'
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
import { authService } from '@/features/auth/AuthService.ts'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: authService.getMe,
    staleTime: Infinity,
  })

  const { toggleSidebar } = useSidebar()

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
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
