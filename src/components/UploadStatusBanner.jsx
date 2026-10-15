import { useUploadStatus } from '../lib/uploadStatus'
import { useLanguage } from '../i18n/LanguageContext'

function UploadStatusBanner() {
  const { t } = useLanguage()
  const { phase, progress, message } = useUploadStatus()

  if (phase === 'compressing') {
    return (
      <p className="status-message" role="status">
        {t('admin.compress.running')} {Math.round(progress * 100)}%
      </p>
    )
  }
  if (phase === 'error') {
    return (
      <p className="status-message status-message--error" role="alert">
        {message}
      </p>
    )
  }
  return null
}

export default UploadStatusBanner
