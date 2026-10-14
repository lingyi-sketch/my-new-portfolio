import { useState } from 'react'
import { createAssignment, updateAssignment, ASSIGNMENT_KINDS } from '../lib/assignments'
import { uploadMediaFile, deleteMediaFile } from '../lib/storage'
import './AdminProjectForm.css'

function initialForm(assignment, defaultWeek) {
  return {
    week: String(assignment?.week ?? defaultWeek ?? 1),
    kind: assignment?.kind ?? 'prompt',
    title: assignment?.title ?? '',
    description: assignment?.description ?? '',
    content: assignment?.content ?? '',
    link_url: assignment?.link_url ?? '',
  }
}

function AdminAssignmentForm({ assignment, defaultWeek, onSaved, onCancel }) {
  const isEditing = Boolean(assignment)
  const [form, setForm] = useState(() => initialForm(assignment, defaultWeek))
  const [imageFile, setImageFile] = useState(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [inputKey, setInputKey] = useState(0)

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleMarkdownFile(e) {
    const picked = e.target.files?.[0]
    if (!picked) return
    try {
      const text = await picked.text()
      updateField('content', text)
      setError('')
    } catch {
      setError('파일을 읽지 못했어요. 다시 선택해 주세요.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const uploaded = []
    try {
      const { kind } = form
      const keep = (field) => (assignment && assignment.kind === kind ? assignment[field] : null)

      const values = {
        week: Number(form.week),
        kind,
        title: form.title,
        description: form.description,
        content: null,
        image_url: null,
        file_url: null,
        link_url: null,
      }

      if (kind === 'prompt') {
        values.content = form.content
      } else if (kind === 'game') {
        values.link_url = form.link_url || null
      } else if (kind === 'image') {
        if (imageFile) {
          values.image_url = await uploadMediaFile('images', imageFile)
          uploaded.push(values.image_url)
        } else {
          values.image_url = keep('image_url')
        }
      } else if (kind === 'video') {
        values.link_url = form.link_url || null
        if (file) {
          values.file_url = await uploadMediaFile('videos', file)
          uploaded.push(values.file_url)
        } else {
          values.file_url = keep('file_url')
        }
      } else if (kind === 'document') {
        if (file) {
          values.file_url = await uploadMediaFile('documents', file)
          uploaded.push(values.file_url)
        } else {
          values.file_url = keep('file_url')
        }
      }

      if (isEditing) {
        await updateAssignment(assignment.id, values)
        for (const key of ['image_url', 'file_url']) {
          if (assignment[key] && assignment[key] !== values[key]) {
            await deleteMediaFile(assignment[key])
          }
        }
      } else {
        await createAssignment(values)
        setForm((prev) => ({ ...initialForm(null, prev.week), kind: prev.kind }))
        setImageFile(null)
        setFile(null)
        setInputKey((key) => key + 1)
      }
      onSaved?.()
    } catch {
      for (const url of uploaded) {
        await deleteMediaFile(url)
      }
      setError(
        isEditing
          ? '과제 수정에 실패했어요. 입력하신 내용은 그대로 남아있으니 다시 시도해 주세요.'
          : '과제 등록에 실패했어요. 입력하신 내용은 그대로 남아있으니 다시 시도해 주세요.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const replaceHint = isEditing ? ' (바꿀 때만 선택)' : ''

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form__row">
        <label className="admin-form__field">
          <span>주차</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.week}
            onChange={(e) => updateField('week', e.target.value)}
            required
          />
        </label>
        <label className="admin-form__field">
          <span>과제 종류</span>
          <select
            value={form.kind}
            onChange={(e) => {
              updateField('kind', e.target.value)
              setImageFile(null)
              setFile(null)
              setInputKey((key) => key + 1)
            }}
          >
            {ASSIGNMENT_KINDS.map((kind) => (
              <option key={kind.key} value={kind.key}>
                {kind.formLabel}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="admin-form__field">
        <span>제목</span>
        <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
      </label>

      <label className="admin-form__field">
        <span>설명</span>
        <textarea rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
      </label>

      {form.kind === 'prompt' && (
        <>
          <label className="admin-form__field">
            <span>md 파일 불러오기 (아래 내용 칸에 채워져요)</span>
            <input key={`md-${inputKey}`} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={handleMarkdownFile} />
          </label>
          <label className="admin-form__field">
            <span>프롬프트 내용 (직접 수정 가능)</span>
            <textarea rows={8} value={form.content} onChange={(e) => updateField('content', e.target.value)} />
          </label>
        </>
      )}

      {form.kind === 'game' && (
        <label className="admin-form__field">
          <span>영상 URL (YouTube, Vimeo 등)</span>
          <input
            type="url"
            placeholder="https://"
            value={form.link_url}
            onChange={(e) => updateField('link_url', e.target.value)}
          />
        </label>
      )}

      {form.kind === 'image' && (
        <label className="admin-form__field">
          <span>이미지 파일{replaceHint}</span>
          <input
            key={`img-${inputKey}`}
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}

      {form.kind === 'video' && (
        <>
          <label className="admin-form__field">
            <span>영상 파일{replaceHint}</span>
            <input
              key={`vid-${inputKey}`}
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="admin-form__field">
            <span>또는 영상 URL (파일이 없을 때)</span>
            <input
              type="url"
              placeholder="https://"
              value={form.link_url}
              onChange={(e) => updateField('link_url', e.target.value)}
            />
          </label>
        </>
      )}

      {form.kind === 'document' && (
        <label className="admin-form__field">
          <span>문서 파일 (PDF · Word){replaceHint}</span>
          <input
            key={`doc-${inputKey}`}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}

      {error && <p className="admin-form__error">{error}</p>}

      <div className="admin-form__actions">
        <button type="submit" disabled={submitting}>
          {submitting ? '저장 중…' : isEditing ? '수정 저장' : '과제 등록'}
        </button>
        {isEditing && (
          <button type="button" className="admin-form__cancel" onClick={onCancel}>
            취소
          </button>
        )}
      </div>
    </form>
  )
}

export default AdminAssignmentForm
