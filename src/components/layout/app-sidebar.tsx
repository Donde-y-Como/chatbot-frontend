import { ComponentProps } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { authService } from '@/features/auth/AuthService.ts'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: authService.getMe,
  })

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {user ? <NavUser user={user} /> : <Skeleton className='w-full h-3' />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
