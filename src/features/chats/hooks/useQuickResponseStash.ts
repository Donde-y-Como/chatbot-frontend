import { useCallback, useMemo, useState } from 'react'
import {
  DefaultMessageBatchProcessor,
  DefaultMessageSenderService,
  MessageBatch,
} from '@/features/chats/services/MessageSenderService'
import { QuickResponse } from '@/features/settings/quickResponse/types'

export interface QuickResponseStashState {
  quickResponse: QuickResponse | null
  messageBatch: MessageBatch | null
  isStashed: boolean
}

export interface QuickResponseStashActions {
  stashQuickResponse: (quickResponse: QuickResponse) => void
  clearStash: () => void
  getStashedBatch: () => MessageBatch | null
}

export const useQuickResponseStash = (): QuickResponseStashState &
  QuickResponseStashActions => {
  const [stashState, setStashState] = useState<QuickResponseStashState>({
    quickResponse: null,
    messageBatch: null,
    isStashed: false,
  })

  const messageSender = useMemo(() => new DefaultMessageSenderService(), [])
  const batchProcessor = useMemo(
    () => new DefaultMessageBatchProcessor(messageSender),
    [messageSender]
  )

  const stashQuickResponse = useCallback(
    (quickResponse: QuickResponse) => {
      const messageBatch = batchProcessor.createBatch(quickResponse)

      if (batchProcessor.validateBatch(messageBatch)) {
        setStashState({
          quickResponse,
          messageBatch,
          isStashed: true,
        })
      } else {
        console.warn('Invalid quick response batch:', messageBatch)
      }
    },
    [batchProcessor]
  )

  const clearStash = useCallback(() => {
    setStashState({
      quickResponse: null,
      messageBatch: null,
      isStashed: false,
    })
  }, [])

  const getStashedBatch = useCallback(() => {
    return stashState.messageBatch
  }, [stashState.messageBatch])

  return {
    ...stashState,
    stashQuickResponse,
    clearStash,
    getStashedBatch,
  }
}
