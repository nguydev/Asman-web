import { useRef, useState } from 'react'
import { useFileUploader } from '../../hooks/useFileUploader.js'
import Icon from '../common/Icon.jsx'

export default function FileUpload({ 
  onUploadComplete, 
  accept, 
  maxSize = 50 * 1024 * 1024, // 50MB default
  visibility = 'PRIVATE',
  className = '',
  label = 'Upload a file',
  hint = 'Drag & drop your file here, or click to select'
}) {
  const { uploadFile, isUploading, progress, error, setError, setProgress } = useFileUploader()
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return false
    }
    return true
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!validateFile(file)) return
    
    try {
      const uploadedFile = await uploadFile(file, visibility)
      if (onUploadComplete) {
        onUploadComplete(uploadedFile)
      }
    } catch {
      // Error is handled by hook
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    
    if (!validateFile(file)) return
    
    try {
      const uploadedFile = await uploadFile(file, visibility)
      if (onUploadComplete) {
        onUploadComplete(uploadedFile)
      }
    } catch {
      // Error is handled by hook
    }
  }

  const handleRemoveError = () => {
    setError(null)
    setProgress(0)
  }

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{label}</label>}
      
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 
          ${isUploading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50'} 
          ${isDragOver ? 'border-brand bg-brand/5 dark:bg-brand/10' : 'border-zinc-300 dark:border-zinc-700'}
          ${error ? 'border-red-500/50 bg-red-50/50 dark:border-red-500/30 dark:bg-red-500/5' : 'bg-white dark:bg-zinc-950'}
        `}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileSelect}
          accept={accept}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 text-brand font-medium">
              <Icon name="spinner" size={24} className="animate-spin" />
              <span>Uploading... {progress}%</span>
            </div>
            <div className="w-full max-w-xs h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
              <Icon name="warning" size={20} />
            </span>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveError()
              }}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 mt-1"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-2">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand dark:bg-brand-dark/15 dark:text-brand-dark transition-transform group-hover:scale-110">
              <Icon name="upload" size={24} />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Click to upload or drag and drop</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{hint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
