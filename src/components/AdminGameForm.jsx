import { useState } from 'react'
import { createGame, updateGame } from '../lib/games'
import { uploadMediaFile } from '../lib/storage'
import { useLanguage } from '../i18n/LanguageContext'
import './AdminProjectForm.css'

const emptyForm = { title: '', synopsis: '', video_description: '', link_url: '' }

function AdminGameForm({ game, onSaved, onCancel }) {
  const { t } = useLanguage()
  const isEditing = Boolean(game)
  const [form, setForm] = useState(
    isEditing
      ? {
          title: game.title ?? '',
          synopsis: game.synopsis ?? '',
          video_description: game.video_description ?? '',
          link_url: game.link_url ?? '',
        }
      : emptyForm,
  )
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
      let video_url = game?.video_url ?? null

      if (videoFile) {
        video_url = await uploadMediaFile('videos', videoFile)
      }

      const payload = {
        title: form.title,
        synopsis: form.synopsis,
        video_description: form.video_description,
        link_url: form.link_url,
        video_url,
      }

      if (isEditing) {
        await updateGame(game.id, payload)
      } else {
        await createGame(payload)
      }

      if (!isEditing) {
        setForm(emptyForm)
        setVideoFile(null)
      }
      onSaved?.()
    } catch {
      setError(t(isEditing ? 'admin.gameForm.editFailed' : 'admin.gameForm.createFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label className="admin-form__field">
        <span>{t('admin.gameForm.title')}</span>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          required
        />
      </label>

      <label className="admin-form__field">
        <span>{t('admin.gameForm.synopsis')}</span>
        <textarea
          rows={3}
          value={form.synopsis}
          onChange={(e) => updateField('synopsis', e.target.value)}
        />
      </label>

      <label className="admin-form__field">
        <span>
          {t('admin.gameForm.videoFile')}
          {isEditing && t('common.replaceHint')}
        </span>
        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
      </label>

      <label className="admin-form__field">
        <span>{t('admin.gameForm.videoDesc')}</span>
        <textarea
          rows={3}
          value={form.video_description}
          onChange={(e) => updateField('video_description', e.target.value)}
        />
      </label>

      <label className="admin-form__field">
        <span>{t('admin.gameForm.link')}</span>
        <input
          type="url"
          placeholder="https://"
          value={form.link_url}
          onChange={(e) => updateField('link_url', e.target.value)}
        />
      </label>

      {error && <p className="admin-form__error">{error}</p>}

      <div className="admin-form__actions">
        <button type="submit" disabled={submitting}>
          {submitting ? t('common.saving') : isEditing ? t('admin.project.saveEdit') : t('admin.gameForm.submit')}
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

export default AdminGameForm
