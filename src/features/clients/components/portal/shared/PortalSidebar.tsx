import {
  Calendar,
  History,
  PartyPopper,
  ShoppingCart,
  Package,
  UserCircle,
  MessageCircle,
  Home,
  Users,
  Star,
  Plus,
  Wrench
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PortalSection } from './portalTypes'
import { cn } from '@/lib/utils'

interface PortalSidebarProps {
  activeSection: PortalSection
  onSectionChange: (section: PortalSection, target?: 'self' | 'other' | null) => void
  appointmentsCount?: number
  servicesHistoryCount?: number
}

interface NavItem {
  section: PortalSection
  target?: 'self' | 'other' | null
  icon: React.ElementType
  label: string
  count?: number
  color: string
  hoverColor: string
  disabled?: boolean
  badge?: string
}

export function PortalSidebar({
  activeSection,
  onSectionChange,
  appointmentsCount,
  servicesHistoryCount
}: PortalSidebarProps) {
  const navItems: NavItem[] = [
    {
      section: 'overview',
      icon: Home,
      label: 'Inicio',
      color: 'text-gray-700 dark:text-gray-300',
      hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-800'
    },
    {
      section: 'profile',
      icon: UserCircle,
      label: 'Mi Perfil',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
    }
  ]

  const appointmentItems: NavItem[] = [
    {
      section: 'appointments',
      icon: Calendar,
      label: 'Mis Citas',
      count: appointmentsCount,
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      section: 'booking',
      target: null,
      icon: Plus,
      label: 'Agendar Cita',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-50 dark:hover:bg-green-900/20'
    },
    {
      section: 'history',
      icon: History,
      label: 'Historial',
      count: servicesHistoryCount,
      color: 'text-indigo-600 dark:text-indigo-400',
      hoverColor: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
    }
  ]

  const eventItems: NavItem[] = [
    {
      section: 'events',
      icon: PartyPopper,
      label: 'Ver Eventos',
      color: 'text-orange-600 dark:text-orange-400',
      hoverColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      disabled: true,
      badge: 'En desarrollo'
    },
    {
      section: 'event-booking',
      target: null,
      icon: Star,
      label: 'Reservar Evento',
      color: 'text-pink-600 dark:text-pink-400',
      hoverColor: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
      disabled: true,
      badge: 'En desarrollo'
    },
    {
      section: 'event-history',
      icon: Users,
      label: 'Mis Reservas',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      disabled: true,
      badge: 'En desarrollo'
    }
  ]

  const orderItems: NavItem[] = [
    {
      section: 'orders',
      icon: Package,
      label: 'Ver Servicios',
      color: 'text-purple-600 dark:text-purple-400',
      hoverColor: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      disabled: true,
      badge: 'En desarrollo'
    },
    {
      section: 'order-create',
      target: null,
      icon: ShoppingCart,
      label: 'Hacer Pedido',
      color: 'text-cyan-600 dark:text-cyan-400',
      hoverColor: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
      disabled: true,
      badge: 'En desarrollo'
    },
    {
      section: 'order-history',
      icon: History,
      label: 'Mis Órdenes',
      color: 'text-teal-600 dark:text-teal-400',
      hoverColor: 'hover:bg-teal-50 dark:hover:bg-teal-900/20',
      disabled: true,
      badge: 'En desarrollo'
    }
  ]

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon
    const isActive = activeSection === item.section

    return (
      <Button
        key={item.label}
        variant="ghost"
        disabled={item.disabled}
        className={cn(
          'w-full justify-start h-auto py-3 px-4 transition-all duration-200',
          item.disabled ? 'opacity-60 cursor-not-allowed' : item.hoverColor,
          isActive && 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600'
        )}
        onClick={() => !item.disabled && onSectionChange(item.section, item.target)}
      >
        <Icon className={cn('h-5 w-5 mr-3', isActive ? 'text-blue-600 dark:text-blue-400' : item.color)} />
        <span className={cn(
          'flex-1 text-left font-medium',
          isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
        )}>
          {item.label}
        </span>
        {item.badge && (
          <Wrench className="h-4 w-4 ml-2 text-yellow-600 dark:text-yellow-400" />
        )}
        {item.count !== undefined && item.count > 0 && !item.badge && (
          <Badge variant="secondary" className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {item.count}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 h-full sticky top-4">
      <div className="p-4 space-y-6">
        {/* Navigation Items */}
        <div className="space-y-1">
          {navItems.map(renderNavItem)}
        </div>

        <Separator />

        {/* Citas Section */}
        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Citas
          </h3>
          <div className="space-y-1">
            {appointmentItems.map(renderNavItem)}
          </div>
        </div>

        <Separator />

        {/* Eventos Section */}
        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Eventos
          </h3>
          <div className="space-y-1">
            {eventItems.map(renderNavItem)}
          </div>
        </div>

        <Separator />

        {/* Órdenes Section */}
        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Órdenes
          </h3>
          <div className="space-y-1">
            {orderItems.map(renderNavItem)}
          </div>
        </div>

        <Separator />

        {/* Support */}
        <Button
          variant="ghost"
          disabled
          className="w-full justify-start h-auto py-3 px-4 opacity-60 cursor-not-allowed"
          onClick={() => {}}
        >
          <MessageCircle className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
          <span className="flex-1 text-left font-medium text-gray-700 dark:text-gray-300">
            Soporte
          </span>
          <Wrench className="h-4 w-4 ml-2 text-yellow-600 dark:text-yellow-400" />
        </Button>
      </div>
    </Card>
  )
}
