import React from 'react'
import { motion } from "framer-motion"
import { cn } from '@/lib/utils.ts'


export function IconIaEnabled({ onToggle, enabled, tooltip }) {
  return (
    <div className="group relative bg-sidebar rounded-full select-none">
      <motion.div
        className={cn("w-14 h-8 bg-primary rounded-full p-1 cursor-pointer", enabled && "bg-secondary")}
        onClick={() => onToggle(!enabled)}
        animate={{ backgroundColor: enabled ? "var(--secondary)" : "var(--primary)" }}
      >
        <motion.div
          className="w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-sm"
          animate={{
            x: enabled ? 24 : 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <img src={enabled ? "/images/robot.svg" : "/images/robot-disabled.svg"} alt="robot" className="w-5 h-5" />
        </motion.div>
      </motion.div>
      <span
        className="absolute right-full bottom-0 scale-0 rounded bg-popover p-2 text-xs text-popover-foreground group-hover:scale-100 whitespace-nowrap shadow-md">
        {tooltip}
      </span>
    </div>
  )
}
