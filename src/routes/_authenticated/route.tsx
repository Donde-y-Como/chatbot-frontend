import Cookies from 'js-cookie'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore.ts'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { useWebSocket } from '@/hooks/use-web-socket.ts'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
})

function RouteComponent() {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false'
  const { socket, isConnected, setIsConnected } = useWebSocket()
  const auth = useAuth()
  if (auth.user && !isConnected) {
    socket.emit('joinBusinessRoom', auth.user.id)
    setIsConnected(true)
  }

  if(!auth.user) {
    return <Navigate to='/iniciar-sesion' />
  }

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'max-w-full w-full ml-auto',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'transition-[width] ease-linear duration-200',
            'h-svh flex flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh'
          )}
        >
          <Outlet />
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
