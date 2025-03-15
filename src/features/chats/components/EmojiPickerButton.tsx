import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { IconMoodSmile } from '@tabler/icons-react'
import EmojiPicker, { EmojiClickData, Theme, SuggestionMode } from 'emoji-picker-react'

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: EmojiClickData) => void
}

export function EmojiPickerButton({ onEmojiSelect }: EmojiPickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
          <IconMoodSmile size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" side="top" onClick={(e) => e.stopPropagation()}>
        <EmojiPicker
          onEmojiClick={(emojiData) => {
            onEmojiSelect(emojiData)
            // Only close if it's not a skin tone selector click
            if (!emojiData.isCustom && !emojiData.names.some(name => name.includes('tone'))) {
              setTimeout(() => setIsOpen(false), 100)
            }
          }}
          skinTonesDisabled={false}
          searchDisabled={false}
          theme={Theme.DARK}
          suggestedEmojisMode={SuggestionMode.RECENT}
          width="100%"
          height="350px"
          previewConfig={{ showPreview: false }}
          lazyLoadEmojis
          searchPlaceHolder="Buscar emoji..."
        />
      </PopoverContent>
    </Popover>
  )
}
