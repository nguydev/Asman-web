import { useFileDownloader } from '../../hooks/useFileDownloader.js'
import Icon from '../common/Icon.jsx'
import { Button } from '../ui/Button.jsx'

export default function FileDownload({
  file,
  showPreview = false,
  className = ''
}) {
  const { downloadFile, isDownloading, error } = useFileDownloader()

  if (!file) return null

  const handleDownload = () => {
    downloadFile(file.id, file.originalName)
  }

  const isImage = file.contentType?.startsWith('image/')
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2)

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 ${className}`}>
      {showPreview && isImage && file.visibility === 'PUBLIC' && file.url && (
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-950 mb-2">
          <img
            src={file.url}
            alt={file.originalName}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <Icon name={isImage ? 'image' : 'file'} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={file.originalName}>
              {file.originalName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {file.contentType.split('/')[1] || 'FILE'}
              </p>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {sizeMb} MB
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          icon={isDownloading ? 'spinner' : 'arrowDown'}
          className={isDownloading ? 'opacity-80' : ''}
        >
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-2.5 rounded-lg">
          <Icon name="warning" size={16} />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}
