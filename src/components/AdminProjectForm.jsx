import { useState } from 'react'
import { createProject, updateProject } from '../lib/projects'
import { uploadMediaFile } from '../lib/storage'
import { useLanguage } from '../i18n/LanguageContext'
import './AdminProjectForm.css'

const emptyForm = { title: '', description: '' }

const SECOND_FILE_CONFIG = {
  script: {
    folder: 'documents',
    labelKey: 'admin.project.scriptFile',
    accept:
      '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  video: {
    folder: 'videos',
    labelKey: 'admin.project.videoFile',
    accept: 'video/*',
  },
}

function AdminProjectForm({ category, project, onSaved, onCancel }) {
  const { t } = useLanguage()
  const isEditing = Boolean(project)
  const effectiveCategory = project?.category ?? category
  const secondFile = SECOND_FILE_CONFIG[effectiveCategory] ?? SECOND_FILE_CONFIG.video
  const [form, setForm] = useState(
    isEditing ? { title: project.title ?? '', description: project.description ?? '' } : emptyForm,
  )
  const [imageFile, setImageFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      let image_url = project?.image_url ?? null
      let video_url = project?.video_url ?? null

      if (imageFile) {
        image_url = await uploadMediaFile('images', imageFile)
      }
      if (videoFile) {
        video_url = await uploadMediaFile(secondFile.folder, videoFile)
      }

      const payload = {
        category: project?.category ?? category,
        title: form.title,
        description: form.description,
        image_url,
        video_url,
      }

      if (isEditing) {
        await updateProject(project.id, payload)
      } else {
        await createProject(payload)
      }

      if (!isEditing) {
        setForm(emptyForm)
        setImageFile(null)
        setVideoFile(null)
      }
      onSaved?.()
    } catch {
      // 입력값은 그대로 유지하고 에러만 안내합니다.
      setError(t(isEditing ? 'admin.project.editFailed' : 'admin.project.createFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label className="admin-form__field">
        <span>{t('common.title')}</span>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          required
        />
      </label>

      <label className="admin-form__field">
        <span>{t('common.description')}</span>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </label>

      <label className="admin-form__field">
        <span>
          {t('admin.project.imageFile')}
          {isEditing && t('common.replaceHint')}
        </span>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
      </label>

      <label className="admin-form__field">
        <span>
          {t(secondFile.labelKey)}
          {isEditing && t('common.replaceHint')}
        </span>
        <input
          type="file"
          accept={secondFile.accept}
          onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {error && <p className="admin-form__error">{error}</p>}

      <div className="admin-form__actions">
        <button type="submit" disabled={submitting}>
          {submitting ? t('common.saving') : isEditing ? t('admin.project.saveEdit') : t('admin.project.submit')}
        </button>
        {isEditing && (
          <button type="button" className="admin-form__cancel" onClick={onCancel}>
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}

export default AdminProjectForm
