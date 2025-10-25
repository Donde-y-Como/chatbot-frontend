import { Outlet } from '@tanstack/react-router'
import { useMemo } from 'react'
import {
  IconBrandWhatsapp,
  IconCategory,
  IconMessage,
  IconRulerMeasure,
  IconShield,
  IconTags,
  IconTool,
  IconUser,
  IconRobot,
  IconTemplate,
} from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'
import { Main } from '@/components/layout/main'
import SidebarNav from './components/sidebar-nav'
import { useAuth } from '@/stores/authStore'
import { useGetRoles, getUserPermissions } from '@/hooks/useAuth'
import { getRoutePermissions, hasRoutePermissions } from '@/lib/route-permissions'

export default function Settings() {
  const { user } = useAuth()
  const { data: roles } = useGetRoles()

  // Get user permissions for filtering settings items
  const userPermissions = useMemo(() => {
    return getUserPermissions(user, roles || [])
  }, [user, roles])

  // Check if user has permission to access a route
  const hasPermission = (href: string) => {
    const requiredPermissions = getRoutePermissions(href)
    
    // If no permissions required, allow access
    if (requiredPermissions.length === 0) {
      return true
    }

    // Check if user is owner (has wildcard permission)
    const isOwner = userPermissions.includes('*')
    
    return isOwner || hasRoutePermissions(userPermissions, requiredPermissions)
  }

  // Filter sidebar items based on permissions
  const filteredSidebarNavItems = useMemo(() => {
    return sidebarNavItems.filter(item => hasPermission(item.href))
  }, [userPermissions])

  return (
    <>
      <Main fixed>
        <section className='pt-2 pl-2'>
          <div className='w-full flex sm:items-center flex-col sm:flex-row  sm:justify-between'>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2 items-center'>
                <SidebarTrigger variant='outline' className='' />
                <Separator orientation='vertical' className='h-7 ' />
                <h1 className='text-2xl font-bold'>Configuraciones</h1>
              </div>
              <p className='text-muted-foreground self-start sm:mb-0'>
                Administra tu cuenta
              </p>
            </div>
          </div>
        </section>
        <Separator className='my-2' />
        <div className='flex flex-1 flex-col space-y-2 md:space-y-2 overflow-hidden lg:flex-row lg:space-x-12 lg:space-y-0'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={filteredSidebarNavItems} />
          </aside>
          <div className='flex w-full p-1 pr-4 overflow-y-hidden'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}

const sidebarNavItems = [
  {
    title: 'Perfil',
    icon: <IconUser size={18} />,
    href: '/settings',
  },
  {
    title: 'WhatsApp API',
    icon: <IconTool size={18} />,
    href: '/settings/account',
  },
  {
    title: 'WhatsApp Web',
    icon: <IconBrandWhatsapp size={18} />,
    href: '/settings/whatsapp',
  },
  {
    title: 'Respuestas Rápidas',
    icon: <IconMessage size={18} />,
    href: '/settings/quick-responses',
  },
  {
    title: 'Plantillas de Mensajes',
    icon: <IconTemplate size={18} />,
    href: '/settings/message-templates',
  },
  {
    title: 'Unidades de Medida',
    icon: <IconRulerMeasure size={18} />,
    href: '/settings/units',
  },
  {
    title: 'Categorias',
    icon: <IconCategory size={18} />,
    href: '/settings/categories',
  },
  {
    title: 'Etiquetas',
    icon: <IconTags size={18} />,
    href: '/settings/tags',
  },
  {
    title: 'Roles',
    icon: <IconShield size={18} />,
    href: '/settings/roles',
  },
  {
    title: 'Asistente IA',
    icon: <IconRobot size={18} />,
    href: '/settings/ai-assistant',
  },
]
