import { useState, useCallback } from 'react'
import {
  fileService,
  resolveFileUrl,
  uploadPublicAsset as uploadPublicAssetApi,
} from '../api/services/fileService.js'

export { resolveFileUrl }

export function useFileUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const uploadFile = useCallback(async (file, visibility = 'PRIVATE') => {
    setIsUploading(true)
    setProgress(0)
    setError(null)

    try {
      const urlRes = await fileService.requestUploadUrl({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        visibility,
      })

      const { file: dbFile, upload } = urlRes.data.data

      await fileService.uploadToStorage(
        upload.url,
        file,
        upload.headers,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
          setProgress(percentCompleted)
        },
      )

      await fileService.completeUpload(dbFile.id)

      setIsUploading(false)
      setProgress(100)
      return { ...dbFile, status: 'UPLOADED' }
    } catch (err) {
      console.error('Upload error:', err)
      let errorMsg = 'Upload failed'

      if (err.message === 'Network Error') {
        errorMsg =
          'Network Error: This is likely a CORS issue on the Cloudflare R2 bucket. Please configure CORS for the bucket.'
      } else if (
        err.response?.data &&
        typeof err.response.data === 'string' &&
        err.response.data.includes('<Error>')
      ) {
        const match =
          err.response.data.match(/<Message>(.*?)<\/Message>/) ||
          err.response.data.match(/<Code>(.*?)<\/Code>/)
        if (match) {
          errorMsg = `S3 Error: ${match[1]}`
        } else {
          errorMsg = `S3 Error: ${err.response.status}`
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message
      } else if (err.message) {
        errorMsg = err.message
      }

      setError(errorMsg)
      setIsUploading(false)
      throw err
    }
  }, [])

  /**
   * Upload public media (avatars, logos) and return a durable URL for DB fields.
   */
  const uploadPublicAsset = useCallback(
    async (file, options = {}) => {
      setIsUploading(true)
      setProgress(0)
      setError(null)
      try {
        const result = await uploadPublicAssetApi(file, options)
        setIsUploading(false)
        setProgress(100)
        return result
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Upload failed'
        setError(typeof message === 'string' ? message : 'Upload failed')
        setIsUploading(false)
        throw err
      }
    },
    [],
  )

  return {
    uploadFile,
    uploadPublicAsset,
    isUploading,
    progress,
    error,
    setError,
    setProgress,
  }
}
