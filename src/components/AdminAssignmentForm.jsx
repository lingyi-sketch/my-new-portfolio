import { useState } from 'react'
import { createAssignment, updateAssignment, storedUrls } from '../lib/assignments'
import { uploadMediaFile, deleteMediaFile } from '../lib/storage'
import { UrlPreview, parseHttpUrl } from './FilePreview'
import { useLanguage } from '../i18n/LanguageContext'
import './AdminProjectForm.css'

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp']
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'm4v']
const FILE_ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.webm,.m4v'

function folderFor(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (IMAGE_EXTENSIONS.includes(extension)) return 'images'
  if (VIDEO_EXTENSIONS.includes(extension)) return 'videos'
  return 'documents'
}

const newPrompt = (prompt = {}) => ({ key: crypto.randomUUID(), title: prompt.title ?? '', content: prompt.content ?? '' })
const newFile = (file = {}) => ({ key: crypto.randomUUID(), label: file.label ?? '', url: file.url ?? '', file: null })

function initialState(assignment, defaultWeek) {
  return {
    week: String(assignment?.week ?? defaultWeek ?? 1),
    course: assignment?.course ?? '',
    entry_date: assignment?.entry_date ?? '',
    title: assignment?.title ?? '',
    description: assignment?.description ?? '',
    body: assignment?.body ?? '',
    result_url: assignment?.result_url ?? '',
    prompts: (assignment?.prompts ?? []).map(newPrompt),
    files: (assignment?.files ?? []).map(newFile),
  }
}

function AdminAssignmentForm({ assignment, defaultWeek, onSaved, onCancel }) {
  const { t } = useLanguage()
  const isEditing = Boolean(assignment)
  const [form, setForm] = useState(() => initialState(assignment, defaultWeek))
  const [coverFile, setCoverFile] = useState(null)
  const [removeCover, setRemoveCover] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const patch = (values) => setForm((prev) => ({ ...prev, ...values }))
  const patchItem = (field, key, values) =>
    setForm((prev) => ({ ...prev, [field]: prev[field].map((item) => (item.key === key ? { ...item, ...values } : item)) }))
  const removeItem = (field, key) =>
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((item) => item.key !== key) }))

  async function loadMarkdown(e) {
    const picked = e.target.files?.[0]
    if (!picked) return
    try {
      patch({ body: await picked.text() })
    } catch {
      // keep the current text if the file cannot be read
    }
  }

  async function loadPromptFile(key, e) {
    const picked = e.target.files?.[0]
    if (!picked) return
    try {
      patchItem('prompts', key, { content: await picked.text() })
    } catch {
      // keep the current text if the file cannot be read
    }
  }

  async function save() {
    const uploaded = []
    try {
      let cover_url = removeCover ? null : (assignment?.cover_url ?? null)
      if (coverFile) {
        cover_url = await uploadMediaFile('images', coverFile)
        uploaded.push(cover_url)
      }

      const files = []
      for (const row of form.files) {
        let url = row.url.trim()
        if (row.file) {
          url = await uploadMediaFile(folderFor(row.file), row.file)
          uploaded.push(url)
        }
        if (!url) continue
        files.push({ label: row.label.trim() || row.file?.name || url, url })
      }

      const values = {
        week: Number(form.week),
        course: form.course.trim() || null,
        entry_date: form.entry_date || null,
        title: form.title,
        description: form.description,
        body: form.body.trim() ? form.body : null,
        prompts: form.prompts
          .filter((prompt) => prompt.title.trim() || prompt.content.trim())
          .map((prompt) => ({ title: prompt.title.trim(), content: prompt.content })),
        files,
        result_url: form.result_url.trim() || null,
        cover_url,
      }

      if (isEditing) {
        await updateAssignment(assignment.id, values)
        // Files dropped or replaced by this edit would otherwise stay in the bucket.
        const keep = new Set([values.cover_url, ...files.map((file) => file.url)])
        for (const url of storedUrls(assignment)) {
          if (!keep.has(url)) await deleteMediaFile(url)
        }
      } else {
        await createAssignment(values)
      }
    } catch (failure) {
      for (const url of uploaded) await deleteMediaFile(url)
      throw failure
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    for (const url of [form.result_url.trim(), ...form.files.map((row) => row.url.trim())]) {
      if (url && !parseHttpUrl(url)) {
        setError(t('admin.project.badUrl'))
        return
      }
    }

    setSubmitting(true)
    try {
      await save()
      if (!isEditing) {
        setForm({ ...initialState(null, form.week), course: form.course })
        setCoverFile(null)
        setFormKey((value) => value + 1)
      }
      onSaved?.()
    } catch {
      setError(t('admin.assignment.failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-form admin-form--wide" onSubmit={handleSubmit}>
      <div className="admin-assignment-row__pair">
        <label className="admin-form__field admin-form__field--week">
          <span>{t('admin.assignment.week')}</span>
          <input type="number" min="1" step="1" value={form.week} onChange={(e) => patch({ week: e.target.value })} required />
        </label>
        <label className="admin-form__field">
          <span>{t('admin.assignment.course')}</span>
          <input type="text" value={form.course} onChange={(e) => patch({ course: e.target.value })} />
        </label>
        <label className="admin-form__field">
          <span>{t('admin.assignment.date')}</span>
          <input type="date" value={form.entry_date} onChange={(e) => patch({ entry_date: e.target.value })} />
        </label>
      </div>

      <label className="admin-form__field">
        <span>{t('common.title')}</span>
        <input type="text" value={form.title} onChange={(e) => patch({ title: e.target.value })} required />
      </label>

      <label className="admin-form__field">
        <span>{t('admin.assignment.summary')}</span>
        <textarea rows={3} value={form.description} onChange={(e) => patch({ description: e.target.value })} />
      </label>

      <label className="admin-form__field">
        <span>
          {t('admin.assignment.cover')}
          {isEditing && assignment.cover_url && t('common.replaceHint')}
        </span>
        <input
          key={`cover-${formKey}`}
          type="file"
          accept="image/*"
          onChange={(e) => {
            setCoverFile(e.target.files?.[0] ?? null)
            setRemoveCover(false)
          }}
        />
      </label>
      {isEditing && assignment.cover_url && !coverFile && (
        <label className="admin-assignment-row__inline">
          <input type="checkbox" checked={removeCover} onChange={(e) => setRemoveCover(e.target.checked)} />
          {t('admin.assignment.removeCover')}
        </label>
      )}

      <label className="admin-form__field">
        <span>{t('admin.assignment.body')}</span>
        <input key={`md-${formKey}`} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={loadMarkdown} />
        <textarea rows={10} value={form.body} onChange={(e) => patch({ body: e.target.value })} />
      </label>

      <fieldset className="admin-assignment-row">
        <div className="admin-assignment-row__head">
          <span className="admin-assignment-row__title">{t('admin.assignment.promptsTitle')}</span>
        </div>
        {form.prompts.map((prompt, i) => (
          <div key={prompt.key} className="admin-assignment-row__sub">
            <div className="admin-assignment-row__head">
              <span className="admin-hint">{t('admin.assignment.promptN', { n: i + 1 })}</span>
              <button type="button" className="admin-form__cancel" onClick={() => removeItem('prompts', prompt.key)}>
                {t('admin.assignment.removeItem')}
              </button>
            </div>
            <label className="admin-form__field">
              <span>{t('admin.assignment.promptTitle')}</span>
              <input type="text" value={prompt.title} onChange={(e) => patchItem('prompts', prompt.key, { title: e.target.value })} />
            </label>
            <label className="admin-form__field">
              <span>{t('admin.assignment.mdLoad')}</span>
              <input type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={(e) => loadPromptFile(prompt.key, e)} />
            </label>
            <label className="admin-form__field">
              <span>{t('admin.assignment.promptContent')}</span>
              <textarea rows={6} value={prompt.content} onChange={(e) => patchItem('prompts', prompt.key, { content: e.target.value })} />
            </label>
          </div>
        ))}
        <button type="button" className="admin-form__cancel admin-form__add" onClick={() => patch({ prompts: [...form.prompts, newPrompt()] })}>
          {t('admin.assignment.addPrompt')}
        </button>
      </fieldset>

      <fieldset className="admin-assignment-row">
        <div className="admin-assignment-row__head">
          <span className="admin-assignment-row__title">{t('admin.assignment.filesTitle')}</span>
        </div>
        <p className="admin-hint">{t('admin.assignment.filesHint')}</p>
        {form.files.map((row) => (
          <div key={row.key} className="admin-assignment-row__sub">
            <div className="admin-assignment-row__head">
              <span />
              <button type="button" className="admin-form__cancel" onClick={() => removeItem('files', row.key)}>
                {t('admin.assignment.removeItem')}
              </button>
            </div>
            <label className="admin-form__field">
              <span>{t('admin.assignment.fileLabel')}</span>
              <input type="text" value={row.label} onChange={(e) => patchItem('files', row.key, { label: e.target.value })} />
            </label>
            <label className="admin-form__field">
              <span>{t('admin.assignment.fileUrl')}</span>
              <input
                type="url"
                placeholder="https://"
                value={row.url}
                onChange={(e) => patchItem('files', row.key, { url: e.target.value })}
              />
            </label>
            <label className="admin-form__field">
              <span>{t('admin.assignment.fileUpload')}</span>
              <input type="file" accept={FILE_ACCEPT} onChange={(e) => patchItem('files', row.key, { file: e.target.files?.[0] ?? null })} />
            </label>
          </div>
        ))}
        <button type="button" className="admin-form__cancel admin-form__add" onClick={() => patch({ files: [...form.files, newFile()] })}>
          {t('admin.assignment.addFile')}
        </button>
      </fieldset>

      <label className="admin-form__field">
        <span>{t('admin.assignment.resultUrl')}</span>
        <input type="url" placeholder="https://" value={form.result_url} onChange={(e) => patch({ result_url: e.target.value })} />
      </label>
      <UrlPreview url={form.result_url} title={t('admin.assignment.urlPreview')} mediaClassName="url-preview-box" previewClassName="" />

      {error && <p className="admin-form__error">{error}</p>}

      <div className="admin-form__actions">
        <button type="submit" disabled={submitting}>
          {submitting ? t('common.saving') : isEditing ? t('admin.project.saveEdit') : t('admin.assignment.submit')}
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

export default AdminAssignmentForm
