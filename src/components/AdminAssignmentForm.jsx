import { useState } from 'react'
import { createAssignment, updateAssignment, ASSIGNMENT_KINDS } from '../lib/assignments'
import { uploadMediaFile, deleteMediaFile } from '../lib/storage'
import { UrlPreview } from './FilePreview'
import { useLanguage } from '../i18n/LanguageContext'
import './AdminProjectForm.css'

function newRow(kind = 'prompt', assignment = null) {
  return {
    key: crypto.randomUUID(),
    kind: assignment?.kind ?? kind,
    title: assignment?.title ?? '',
    description: assignment?.description ?? '',
    content: assignment?.content ?? '',
    link_url: assignment?.link_url ?? '',
    imageFile: null,
    file: null,
  }
}

async function saveRow(week, row, existing) {
  const uploaded = []
  try {
    const { kind } = row
    const keep = (field) => (existing && existing.kind === kind ? existing[field] : null)

    const values = {
      week,
      kind,
      title: row.title,
      description: row.description,
      content: null,
      image_url: null,
      file_url: null,
      link_url: null,
    }

    if (kind === 'prompt') {
      values.content = row.content
    } else if (kind === 'game') {
      values.link_url = row.link_url || null
    } else if (kind === 'image') {
      if (row.imageFile) {
        values.image_url = await uploadMediaFile('images', row.imageFile)
        uploaded.push(values.image_url)
      } else {
        values.image_url = keep('image_url')
      }
    } else if (kind === 'video') {
      values.link_url = row.link_url || null
      if (row.file) {
        values.file_url = await uploadMediaFile('videos', row.file)
        uploaded.push(values.file_url)
      } else {
        values.file_url = keep('file_url')
      }
    } else if (kind === 'document') {
      if (row.file) {
        values.file_url = await uploadMediaFile('documents', row.file)
        uploaded.push(values.file_url)
      } else {
        values.file_url = keep('file_url')
      }
    }

    if (existing) {
      await updateAssignment(existing.id, values)
      for (const key of ['image_url', 'file_url']) {
        if (existing[key] && existing[key] !== values[key]) {
          await deleteMediaFile(existing[key])
        }
      }
    } else {
      await createAssignment(values)
    }
  } catch (error) {
    for (const url of uploaded) {
      await deleteMediaFile(url)
    }
    throw error
  }
}

function RowFields({ row, index, total, isEditing, onChange, onRemove }) {
  const { t } = useLanguage()
  const replaceHint = isEditing ? t('common.replaceHint') : ''

  async function handleMarkdownFile(e) {
    const picked = e.target.files?.[0]
    if (!picked) return
    try {
      onChange({ content: await picked.text() })
    } catch {
      onChange({ content: row.content })
    }
  }

  return (
    <fieldset className="admin-assignment-row">
      <div className="admin-assignment-row__head">
        <span className="admin-assignment-row__title">{isEditing ? t('admin.assignment.rowEdit') : t('admin.assignment.rowN', { n: index + 1 })}</span>
        {!isEditing && total > 1 && (
          <button type="button" className="admin-form__cancel" onClick={onRemove}>
            {t('admin.assignment.removeRow')}
          </button>
        )}
      </div>

      <label className="admin-form__field">
        <span>{t('admin.assignment.kind')}</span>
        <select
          value={row.kind}
          onChange={(e) => onChange({ kind: e.target.value, imageFile: null, file: null })}
        >
          {ASSIGNMENT_KINDS.map((kind) => (
            <option key={kind.key} value={kind.key}>
              {t(`assignment.kindForm.${kind.key}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="admin-form__field">
        <span>{t('common.title')}</span>
        <input type="text" value={row.title} onChange={(e) => onChange({ title: e.target.value })} required />
      </label>

      <label className="admin-form__field">
        <span>{t('common.description')}</span>
        <textarea rows={2} value={row.description} onChange={(e) => onChange({ description: e.target.value })} />
      </label>

      {row.kind === 'prompt' && (
        <>
          <label className="admin-form__field">
            <span>{t('admin.assignment.mdLoad')}</span>
            <input
              key={`${row.key}-md`}
              type="file"
              accept=".md,.markdown,.txt,text/markdown,text/plain"
              onChange={handleMarkdownFile}
            />
          </label>
          <label className="admin-form__field">
            <span>{t('admin.assignment.promptContent')}</span>
            <textarea rows={6} value={row.content} onChange={(e) => onChange({ content: e.target.value })} />
          </label>
        </>
      )}

      {row.kind === 'game' && (
        <>
          <label className="admin-form__field">
            <span>{t('admin.assignment.gameUrl')}</span>
            <input
              type="url"
              placeholder="https://"
              value={row.link_url}
              onChange={(e) => onChange({ link_url: e.target.value })}
            />
          </label>
          <UrlPreview url={row.link_url} title={t('admin.assignment.urlPreview')} mediaClassName="url-preview-box" previewClassName="" />
        </>
      )}

      {row.kind === 'image' && (
        <label className="admin-form__field">
          <span>
            {t('admin.assignment.imageFile')}
            {replaceHint}
          </span>
          <input
            key={`${row.key}-img-${row.kind}`}
            type="file"
            accept="image/*"
            onChange={(e) => onChange({ imageFile: e.target.files?.[0] ?? null })}
          />
        </label>
      )}

      {row.kind === 'video' && (
        <>
          <label className="admin-form__field">
            <span>
              {t('admin.assignment.videoFile')}
              {replaceHint}
            </span>
            <input
              key={`${row.key}-vid`}
              type="file"
              accept="video/*"
              onChange={(e) => onChange({ file: e.target.files?.[0] ?? null })}
            />
          </label>
          <label className="admin-form__field">
            <span>{t('admin.assignment.orVideoUrl')}</span>
            <input
              type="url"
              placeholder="https://"
              value={row.link_url}
              onChange={(e) => onChange({ link_url: e.target.value })}
            />
          </label>
          <UrlPreview url={row.link_url} title={t('admin.assignment.urlPreview')} mediaClassName="url-preview-box" previewClassName="" />
        </>
      )}

      {row.kind === 'document' && (
        <label className="admin-form__field">
          <span>
            {t('admin.assignment.docFile')}
            {replaceHint}
          </span>
          <input
            key={`${row.key}-doc`}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => onChange({ file: e.target.files?.[0] ?? null })}
          />
        </label>
      )}
    </fieldset>
  )
}

function AdminAssignmentForm({ assignment, defaultWeek, onSaved, onCancel }) {
  const { t } = useLanguage()
  const isEditing = Boolean(assignment)
  const [week, setWeek] = useState(String(assignment?.week ?? defaultWeek ?? 1))
  const [rows, setRows] = useState(() => [newRow('prompt', assignment)])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function patchRow(key, patch) {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const remaining = []
    let savedCount = 0
    let failed = false

    for (const row of rows) {
      if (failed) {
        remaining.push(row)
        continue
      }
      try {
        await saveRow(Number(week), row, isEditing ? assignment : null)
        savedCount += 1
      } catch {
        failed = true
        remaining.push(row)
      }
    }

    if (failed) {
      setRows(remaining)
      setError(
        savedCount > 0
          ? t('admin.assignment.partialFail', { saved: savedCount, remaining: remaining.length })
          : t('admin.assignment.failed'),
      )
    } else if (!isEditing) {
      setRows([newRow(rows[rows.length - 1].kind)])
    }

    if (savedCount > 0) onSaved?.()
    setSubmitting(false)
  }

  return (
    <form className="admin-form admin-form--wide" onSubmit={handleSubmit}>
      <label className="admin-form__field admin-form__field--week">
        <span>{t('admin.assignment.week')}</span>
        <input type="number" min="1" step="1" value={week} onChange={(e) => setWeek(e.target.value)} required />
      </label>

      {rows.map((row, index) => (
        <RowFields
          key={row.key}
          row={row}
          index={index}
          total={rows.length}
          isEditing={isEditing}
          onChange={(patch) => patchRow(row.key, patch)}
          onRemove={() => setRows((prev) => prev.filter((item) => item.key !== row.key))}
        />
      ))}

      {!isEditing && (
        <button
          type="button"
          className="admin-form__cancel admin-form__add"
          onClick={() => setRows((prev) => [...prev, newRow(prev[prev.length - 1].kind)])}
        >
          {t('admin.assignment.addRow')}
        </button>
      )}

      {error && <p className="admin-form__error">{error}</p>}

      <div className="admin-form__actions">
        <button type="submit" disabled={submitting}>
          {submitting
            ? t('common.saving')
            : isEditing
              ? t('admin.project.saveEdit')
              : rows.length > 1
                ? t('admin.assignment.submitMany', { n: rows.length })
                : t('admin.assignment.submit')}
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
