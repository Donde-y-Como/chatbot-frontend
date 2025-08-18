import { Link, useRouter } from '@tanstack/react-router'
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Calendar,
  ChevronsUpDown,
  CreditCard,
  LogOut,
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
import { UserData, BusinessData } from '@/features/auth/types.ts'
import { ThemeSwitch } from '@/components/theme-switch.tsx'

export function NavUser({ user, business }: { user: UserData; business?: BusinessData }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const logout = () => {
    authService.logout()
    router.navigate({ to: '/iniciar-sesion', replace: true })
  }

  // Calculate if credits are low (10% or less remaining)
  const creditsPercentage = business ? (business.plan.leftMessages / business.plan.totalMessages) * 100 : 0
  const isLowCredits = creditsPercentage <= 10
  
  // Calculate days until plan expiration
  const today = new Date()
  const endDate = business ? new Date(business.plan.endTimestamp) : new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const isExpirationSoon = daysRemaining > 0 && daysRemaining <= 7
  
  // Format expiry date
  const expiryDate = business ? new Date(business.plan.endTimestamp).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric'
  }) : ''

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
                  src={business?.logo}
                  alt={business?.name || user.email}
                  className='object-cover'
                />
                <AvatarFallback className='rounded-lg'>U</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <div className='flex items-center gap-1'>
                  <span className='truncate font-semibold'>{business?.name || user.email}</span>
                  {isLowCredits && <AlertTriangle className='h-3 w-3 text-red-500' />}
                  {isExpirationSoon && <Calendar className='h-3 w-3 text-amber-500' />}
                </div>
                <div className='flex items-center gap-1 truncate text-xs'>
                  <span>Plan {business?.plan.name || 'N/A'}</span>
                  <span className={`text-muted-foreground ${isExpirationSoon ? 'text-amber-500' : ''}`}>
                    • {expiryDate}
                    {isExpirationSoon && ` (${daysRemaining}d)`}
                  </span>
                  <span 
                    className={`inline-block w-2 h-2 rounded-full ${
                      business?.plan.status === 'active' ? 'bg-green-500' : 'bg-red-500'
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
                    src={business?.logo}
                    alt={business?.name || user.email}
                    className='object-cover'
                  />
                  <AvatarFallback className='rounded-lg'>U</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{business?.name || user.email}</span>
                  <div className='flex items-center gap-1 truncate text-xs'>
                    <span>Plan {business?.plan.name || 'N/A'}</span>
                    {isLowCredits && <AlertTriangle className='h-3 w-3 text-red-500' />}
                    {isExpirationSoon && <Calendar className='h-3 w-3 text-amber-500' />}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {business && (
                <DropdownMenuItem asChild>
                  <Link to='/settings/account'>
                    <CreditsDisplay
                      total={business.plan.totalMessages}
                      remaining={business.plan.leftMessages}
                      usedMessages={business.plan.usedMessages}
                      planName={business.plan.name}
                      endTimestamp={business.plan.endTimestamp}
                      active={business.plan.active}
                      status={business.plan.status}
                    />
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <div className='flex w-full justify-between items-center font-xs'>
                  <p>Tema</p>
                  <ThemeSwitch />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/settings'>
                  <BadgeCheck />
                  Perfil
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
