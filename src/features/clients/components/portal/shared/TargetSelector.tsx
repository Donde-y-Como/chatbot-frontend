import { Card, CardContent } from '@/components/ui/card'
import { User, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TargetSelectorProps {
  onTargetSelect: (target: 'self' | 'other') => void
  title?: string
  subtitle?: string
}

export function TargetSelector({
  onTargetSelect,
  title = '¿Para quién es esta reserva?',
  subtitle = 'Selecciona si vas a agendar para ti o para otra persona'
}: TargetSelectorProps) {
  const options = [
    {
      target: 'self' as const,
      icon: User,
      title: 'Para mí',
      description: 'Voy a asistir personalmente a la cita',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      target: 'other' as const,
      icon: Users,
      title: 'Para otra persona',
      description: 'Voy a agendar en nombre de alguien más',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {options.map((option) => {
          const Icon = option.icon

          return (
            <Card
              key={option.target}
              className={cn(
                'cursor-pointer border-2 border-gray-200 dark:border-gray-700',
                'hover:border-transparent hover:shadow-2xl',
                'transition-all duration-300 group overflow-hidden',
                'hover:scale-105'
              )}
              onClick={() => onTargetSelect(option.target)}
            >
              <CardContent className="p-0">
                {/* Header con gradiente */}
                <div className={cn(
                  'p-8 bg-gradient-to-br transition-all duration-300',
                  option.gradient,
                  option.hoverGradient
                )}>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={cn(
                      'p-6 rounded-2xl backdrop-blur-sm bg-white/20',
                      'group-hover:scale-110 transition-transform duration-300'
                    )}>
                      <Icon className="h-16 w-16 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {option.title}
                      </h3>
                      <p className="text-base text-white/90">
                        {option.description}
                      </p>
                    </div>
                    <ArrowRight className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 mt-4" />
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="p-5 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Seleccionar esta opción
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Footer */}
      <Card className="mt-8 border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Información importante
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Ambas opciones te permiten gestionar la cita completamente. Si agendar para otra persona,
                asegúrate de tener su autorización y datos correctos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
