import { useState } from 'react'
import { api } from '@/api/axiosInstance.ts'
import type { MediaType } from '@/features/chats/ChatTypes'

const VALID_DOCS = {
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
}

const VALID_IMAGES = ['image/png', 'image/jpg', 'image/jpeg']
const VALID_VIDEOS = ['video/mp4']

export const useUploadMedia = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const validateFile = (
    file: File
  ): {
    isValid: boolean
    type: MediaType | null
  } => {
    if (VALID_DOCS[file.type as keyof typeof VALID_DOCS]) {
      return { isValid: true, type: 'document' }
    }
    if (VALID_IMAGES.includes(file.type)) {
      return { isValid: true, type: 'image' }
    }
    if (VALID_VIDEOS.includes(file.type)) {
      return { isValid: true, type: 'video' }
    }
    return { isValid: false, type: null }
  }

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/file-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 0)
          )
          setProgress(percentage)
        },
      })

      return response.data.url
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  return { uploadFile, validateFile, isUploading, progress }
}
