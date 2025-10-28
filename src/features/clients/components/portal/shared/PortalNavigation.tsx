import {
  Calendar,
  Plus,
  History,
  PartyPopper,
  Star,
  Users,
  ShoppingCart,
  Package,
  MessageCircle,
  UserCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PortalSection } from './portalTypes'

interface PortalNavigationProps {
  onSectionChange: (section: PortalSection, target?: 'self' | 'other' | null) => void
  appointmentsCount?: number
  servicesHistoryCount?: number
}

export function PortalNavigation({
  onSectionChange,
  appointmentsCount,
  servicesHistoryCount
}: PortalNavigationProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
        ¿Qué quieres hacer hoy?
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* CITAS */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Citas</span>
          </h3>

          <Card
            className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-r from-blue-500 to-blue-600 text-white overflow-hidden relative"
            onClick={() => onSectionChange('appointments')}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <CardContent className="p-4 relative z-10">
              <div className="text-center space-y-2">
                <Calendar className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold">Ver mis citas</h4>
                <p className="text-blue-100 text-sm">
                  {appointmentsCount ? `${appointmentsCount} citas` : 'Consultar'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-r from-green-500 to-green-600 text-white overflow-hidden relative"
            onClick={() => onSectionChange('booking', null)}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <CardContent className="p-4 relative z-10">
              <div className="text-center space-y-2">
                <Plus className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold">Agendar cita</h4>
                <p className="text-green-100 text-sm">Para mí o alguien más</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-r from-indigo-500 to-indigo-600 text-white overflow-hidden relative"
            onClick={() => onSectionChange('history')}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <CardContent className="p-4 relative z-10">
              <div className="text-center space-y-2">
                <History className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold">Historial</h4>
                <p className="text-indigo-100 text-sm">
                  {servicesHistoryCount ? `${servicesHistoryCount} servicios` : 'Ver historial'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* EVENTOS */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <PartyPopper className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span>Eventos</span>
          </h3>

          <Card
            className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-r from-orange-500 to-orange-600 text-white overflow-hidden relative"
            onClick={() => onSectionChange('events')}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <CardContent className="p-4 relative z-10">
              <div className="text-center space-y-2">
                <PartyPopper className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold">Ver eventos</h4>
                <p className="text-orange-100 text-sm">Eventos disponibles</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-r from-pink-500 to-pink-600 text-white overflow-hidden relative"
            onClick={() => onSectionChange('event-booking', null)}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <CardContent className="p-4 relative z-10">
              <div className="text-center space-y-2">
                <Star className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold">Reservar evento</h4>
                <p className="text-pink-100 text-sm">Para mí o alguien más</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-r from-red-500 to-red-600 text-white overflow-hidden relative"
            onClick={() => onSectionChange('event-history')}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <CardContent className="p-4 relative z-10">
              <div className="text-center space-y-2">
                <Users className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold">Mis reservas</h4>
                <p className="text-red-100 text-sm">Ver reservas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ÓRDENES */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span>Órdenes</span>
          </h3>

          <Card
            className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-r from-purple-500 to-purple-600 text-white overflow-hidden relative"
            onClick={() => onSectionChange('orders')}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <CardContent className="p-4 relative z-10">
              <div className="text-center space-y-2">
                <Package className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold">Ver servicios</h4>
                <p className="text-purple-100 text-sm">Servicios disponibles</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-r from-cyan-500 to-cyan-600 text-white overflow-hidden relative"
            onClick={() => onSectionChange('order-create', null)}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <CardContent className="p-4 relative z-10">
              <div className="text-center space-y-2">
                <ShoppingCart className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold">Hacer pedido</h4>
                <p className="text-cyan-100 text-sm">Para mí o alguien más</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-r from-teal-500 to-teal-600 text-white overflow-hidden relative"
            onClick={() => onSectionChange('order-history')}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <CardContent className="p-4 relative z-10">
              <div className="text-center space-y-2">
                <History className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold">Mis órdenes</h4>
                <p className="text-teal-100 text-sm">Ver pedidos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Perfil y Soporte */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card
          className="border-0 shadow-lg hover:shadow-xl hover:scale-105 dark:hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white overflow-hidden relative"
          onClick={() => onSectionChange('profile')}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl group-hover:bg-white/30 dark:group-hover:bg-white/20 group-hover:scale-110 transition-all">
                <UserCircle className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Mi Perfil</h3>
                <p className="text-blue-100 dark:text-blue-200 text-sm">Ver y editar tu información</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg hover:shadow-xl hover:scale-105 dark:hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white overflow-hidden relative"
          onClick={() => onSectionChange('support')}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl group-hover:bg-white/30 dark:group-hover:bg-white/20 group-hover:scale-110 transition-all">
                <MessageCircle className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Contactar soporte</h3>
                <p className="text-gray-100 dark:text-gray-200 text-sm">¿Necesitas ayuda? Estamos aquí para ti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}