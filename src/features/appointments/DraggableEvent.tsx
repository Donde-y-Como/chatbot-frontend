import type React from "react"
import { useDraggable } from "@dnd-kit/core"
import type { Event } from "./types"

interface DraggableEventProps {
  event: Event
  style: React.CSSProperties
  onClick: () => void
}

export const DraggableEvent: React.FC<DraggableEventProps> = ({ event, style, onClick }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: event.id,
    data: event,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="absolute left-1 right-1 p-2 rounded text-sm cursor-pointer overflow-hidden"
      style={{
        ...style,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      onClick={onClick}
    >
      <div className="font-medium truncate">{event.client}</div>
      <div className="text-xs truncate">{event.service}</div>
    </div>
  )
}

