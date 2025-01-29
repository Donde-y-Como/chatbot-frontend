import React from 'react'
import { Button } from '@/components/ui/button.tsx'

export function IconIaEnabled({ onToggle, enabled, tooltip }) {
  return (
    <Button
      variant='ghost'
      size='icon'
      className='group relative'
      onClick={() => onToggle(!enabled)}
    >
      <img
        src={enabled ? '/images/robot.svg' : '/images/robot-disabled.svg'}
        alt='robot'
        className='w-5 h-5'
      />
      <span className='absolute left-10 scale-0 rounded bg-foreground p-2 text-xs text-background group-hover:scale-100 whitespace-nowrap'>
        {tooltip}
      </span>
    </Button>
  )
}
