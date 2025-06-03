import { Link, useRouter } from '@tanstack/react-router'
import {
  AlertTriangle,
  Calendar,
  ChevronsUpDown,
  LogOut,
  Settings
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { CreditsDisplay } from '@/components/credits-display.tsx'
import { authService } from '@/features/auth/AuthService.ts'
import { UserData } from '@/features/auth/types.ts'
import { ThemeSwitch } from '@/components/theme-switch.tsx'

export function NavUser({ user }: { user: UserData }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const logout = () => {
    authService.logout()
    router.navigate({ to: '/iniciar-sesion', replace: true })
  }

  // Calculate if credits are low (10% or less remaining)
  const creditsPercentage = (user.plan.leftMessages / user.plan.totalMessages) * 100
  const isLowCredits = creditsPercentage <= 10
  
  // Calculate days until plan expiration
  const today = new Date()
  const endDate = new Date(user.plan.endTimestamp)
  const diffTime = endDate.getTime() - today.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const isExpirationSoon = daysRemaining > 0 && daysRemaining <= 7
  
  // Format expiry date
  const expiryDate = new Date(user.plan.endTimestamp).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric'
  })

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage
                  src={user.logo}
                  alt={user.name}
                  className='object-cover'
                />
                <AvatarFallback className='rounded-lg'>U</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <div className='flex items-center gap-1'>
                  <span className='truncate font-semibold'>{user.name}</span>
                  {isLowCredits && <AlertTriangle className='h-3 w-3 text-red-500' />}
                  {isExpirationSoon && <Calendar className='h-3 w-3 text-amber-500' />}
                </div>
                <div className='flex items-center gap-1 truncate text-xs'>
                  <span>Plan {user.plan.name}</span>
                  <span className={`text-muted-foreground ${isExpirationSoon ? 'text-amber-500' : ''}`}>
                    • {expiryDate}
                    {isExpirationSoon && ` (${daysRemaining}d)`}
                  </span>
                  <span 
                    className={`inline-block w-2 h-2 rounded-full ${
                      user.plan.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`} 
                  />
                </div>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage
                    src={user.logo}
                    alt={user.name}
                    className='object-cover'
                  />
                  <AvatarFallback className='rounded-lg'>U</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user.name}</span>
                  <div className='flex items-center gap-1 truncate text-xs'>
                    <span>Plan {user.plan.name}</span>
                    {isLowCredits && <AlertTriangle className='h-3 w-3 text-red-500' />}
                    {isExpirationSoon && <Calendar className='h-3 w-3 text-amber-500' />}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to='/settings/account'>
                  <CreditsDisplay
                    total={user.plan.totalMessages}
                    remaining={user.plan.leftMessages}
                    usedMessages={user.plan.usedMessages}
                    planName={user.plan.name}
                    endTimestamp={user.plan.endTimestamp}
                    active={user.plan.active}
                    status={user.plan.status}
                  />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div className='flex w-full justify-between items-center font-xs'>
                  <p>Tema</p>
                  <ThemeSwitch />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/settings'>
                  <Settings />
                  Configuración
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
