import api from '../axios.js'
import axios from 'axios'

/**
 * Resolve a durable (or temporary) URL for an uploaded file.
 */
export async function resolveFileUrl(fileId) {
  const urlRes = await fileService.getDownloadUrl(fileId)
  const data = urlRes.data?.data ?? urlRes.data
  const url = data?.url ?? data?.downloadUrl
  if (!url) {
    throw new Error('Download URL missing from API response')
  }
  return {
    url,
    expiresIn: typeof data?.expiresIn === 'number' ? data.expiresIn : null,
  }
}

/**
 * Upload a PUBLIC media file and return its durable URL.
 * Prefer this for avatars / logos that are stored in profile fields.
 */
export async function uploadPublicAsset(file, { requireDurable = true } = {}) {
  const uploadRes = await fileService.requestUploadUrl({
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
    size: file.size,
    visibility: 'PUBLIC',
  })
  const { file: fileData, upload } = uploadRes.data.data
  await fileService.uploadToStorage(upload.url, file, {
    'Content-Type': file.type || 'application/octet-stream',
    ...(upload.headers || {}),
  })
  await fileService.completeUpload(fileData.id)

  const { url, expiresIn } = await resolveFileUrl(fileData.id)
  if (expiresIn && requireDurable) {
    throw new Error(
      'Storage is not configured with a public base URL. Avatar/logo URLs would expire.',
    )
  }
  return { id: fileData.id, url, expiresIn }
}

export const fileService = {
  /**
   * Request a presigned URL to upload a file directly to storage
   * @param {{ filename: string, contentType: string, size: number, visibility?: 'PUBLIC' | 'PRIVATE' }} data 
   */
  requestUploadUrl: (data) => api.post('/files/upload-url', data),
  
  /**
   * Uploads a file directly to the provided presigned URL.
   * Uses a clean axios instance to avoid sending API cookies to the storage bucket.
   */
  uploadToStorage: (url, file, headers, onUploadProgress) => 
    axios.put(url, file, {
      headers,
      onUploadProgress
    }),
    
  /**
   * Confirms the upload has finished and the file is ready to use
   */
  completeUpload: (id) => api.post(`/files/${id}/complete`),

  /**
   * Get a presigned download URL for a file
   */
  getDownloadUrl: (id) => api.get(`/files/${id}/download-url`),
  
  /**
   * List the caller's files
   */
  listFiles: (params) => api.get('/files', { params }),
  
  /**
   * Delete a file from storage and drop its metadata
   */
  deleteFile: (id) => api.delete(`/files/${id}`),
}
