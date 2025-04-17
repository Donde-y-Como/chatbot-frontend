import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useState } from "react"

export type AlertType = "error" | "warning" | "success" | "info" | "maintenance"

interface AlertProps {
  type?: AlertType
  message: string
  className?: string
  dismissible?: boolean
}

export function MaintenanceAlert({
                        type = "info",
                        message,
                        className,
                        dismissible = false
                      }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const alertStyles = {
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    success: "bg-green-50 text-green-800 border-green-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
    maintenance: "bg-purple-50 text-purple-800 border-purple-200"
  }

  const iconMap = {
    error: <AlertCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    maintenance: <AlertTriangle className="h-4 w-4" />
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border p-3 text-sm",
        alertStyles[type],
        className
      )}
      role="alert"
    >
      <span className="flex-shrink-0">{iconMap[type]}</span>
      <div className="flex-1">{message}</div>
      {dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-full opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Close alert"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
