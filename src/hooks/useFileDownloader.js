import { useState, useCallback } from 'react'
import { fileService } from '../api/services/fileService.js'

export function useFileDownloader() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState(null)

  const downloadFile = useCallback(async (fileId, originalName) => {
    setIsDownloading(true)
    setError(null)
    
    try {
      // 1. Get presigned download URL
      const urlRes = await fileService.getDownloadUrl(fileId)
      const downloadUrl = urlRes.data.data.url
      
      // 2. Trigger download in browser
      const link = document.createElement('a')
      link.href = downloadUrl
      
      // If the URL doesn't have Content-Disposition attachment, we try to force a download
      // Note: for cross-origin presigned S3 URLs, the download attribute may not work 
      // unless response-content-disposition is set on the URL itself.
      link.setAttribute('download', originalName || 'download')
      link.setAttribute('target', '_blank')
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setIsDownloading(false)
      return downloadUrl
    } catch (err) {
      setIsDownloading(false)
      setError(err.response?.data?.message || err.message || 'Download failed')
      throw err
    }
  }, [])

  return { downloadFile, isDownloading, error, setError }
}
