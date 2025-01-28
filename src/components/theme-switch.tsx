import { useEffect } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/theme-context'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  return (
    <div className='flex items-center gap-1'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size='icon'
            onClick={() => setTheme('system')}
          >
            <Monitor className='h-3 w-3' />
            <span className='sr-only'>System theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>System</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size='icon'
            onClick={() => setTheme('light')}
          >
            <Sun className='h-3 w-3' />
            <span className='sr-only'>Light theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Light</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size='icon'
            onClick={() => setTheme('dark')}
          >
            <Moon className='h-3 w-3' />
            <span className='sr-only'>Dark theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Dark</TooltipContent>
      </Tooltip>
    </div>
  )
}
