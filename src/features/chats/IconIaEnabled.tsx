import React from 'react'
import { motion } from 'framer-motion'

interface IconIaEnabledProps {
  onToggle: (enabled: boolean) => void
  enabled: boolean
  tooltip: string
  bgColor: string
  iconColor: string
}

export function IconIaEnabled({
  onToggle,
  enabled,
  tooltip,
  bgColor,
  iconColor,
}: IconIaEnabledProps) {
  return (
    <div className='group relative bg-sidebar rounded-full select-none'>
      <div
        className={
          'w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ' +
          bgColor
        }
        onClick={() => onToggle(!enabled)}
      >
        <motion.div
          className={'w-6 h-6 rounded-full flex items-center justify-center shadow-sm ' + iconColor}
          animate={{
            x: enabled ? 24 : 0,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <img
            src={enabled ? '/images/robot.svg' : '/images/robot-disabled.svg'}
            alt='robot'
            className='w-5 h-5'
          />
        </motion.div>
      </div>
      <span className='absolute right-full bottom-0 scale-0 rounded bg-popover p-2 text-xs text-popover-foreground group-hover:scale-100 whitespace-nowrap shadow-md'>
        {tooltip}
      </span>
    </div>
  )
}
