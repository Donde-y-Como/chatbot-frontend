import { AxiosError } from 'axios'
import { api } from '@/api/axiosInstance'
import { Media } from '@/features/chats/ChatTypes'

export interface FileUploadResult {
  success: boolean
  url?: string
  error?: string
}

export interface FileUploadResponse {
  url: string
}

// Get file type from mimetype
export const getFileType = (mimetype: string): string => {
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.startsWith('video/')) return 'video'
  if (mimetype.startsWith('audio/')) return 'audio'
  return 'document'
}

// Upload single file
export const uploadSingleFile = async (
  file: File
): Promise<FileUploadResult> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<FileUploadResponse>(
      '/file-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return {
      success: true,
      url: response.data.url,
    }
  } catch (error: unknown) {
    console.error('File upload error:', error)

    let errorMessage = 'Error al subir el archivo'

    if (error instanceof AxiosError) {
      if (error.response?.status === 413) {
        errorMessage = 'El archivo es demasiado grande'
      } else if (error.response?.status === 415) {
        errorMessage = 'Tipo de archivo no soportado'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

// Upload multiple files and return Media objects
export const uploadFiles = async (
  files: File[],
  onProgress?: (uploaded: number, total: number) => void
): Promise<{
  success: boolean
  media: Media[]
  errors: string[]
}> => {
  const results: Media[] = []
  const errors: string[] = []
  let uploadedCount = 0

  for (const file of files) {
    try {
      const uploadResult = await uploadSingleFile(file)

      if (uploadResult.success && uploadResult.url) {
        const media: Media = {
          type: getFileType(file.type),
          url: uploadResult.url,
          mimetype: file.type,
          filename: file.name,
          caption: undefined, // As specified, caption should be undefined
        }

        results.push(media)
      } else {
        errors.push(
          `${file.name}: ${uploadResult.error || 'Error desconocido'}`
        )
      }
    } catch (error) {
      errors.push(`${file.name}: Error inesperado`)
    }

    uploadedCount++
    onProgress?.(uploadedCount, files.length)
  }

  return {
    success: errors.length === 0,
    media: results,
    errors,
  }
}

// Validate file before upload
export const validateFile = (
  file: File
): { valid: boolean; error?: string } => {
  // Check file size (individual file limit - let's set it to 50MB per file)
  const maxFileSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `El archivo ${file.name} excede el límite de 50MB`,
    }
  }

  // Check file type
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    // Audio
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf',
    'application/xml',
    'text/xml',
  ]

  const dangerousTypes = [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-dosexec',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ]

  if (!allowedTypes.includes(file.type) || dangerousTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido: ${file.type}`,
    }
  }

  return { valid: true }
}

// Validate total size of files
export const validateTotalSize = (
  files: File[]
): { valid: boolean; error?: string } => {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const maxTotalSize = 100 * 1024 * 1024 // 100MB

  if (totalSize > maxTotalSize) {
    return {
      valid: false,
      error: `El tamaño total de los archivos (${formatFileSize(totalSize)}) excede el límite de 100MB`,
    }
  }

  return { valid: true }
}

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
