import { useState } from 'react'
import { createProject, updateProject } from '../lib/projects'
import { uploadMediaFile } from '../lib/storage'
import './AdminProjectForm.css'

const emptyForm = { title: '', description: '' }

function AdminProjectForm({ project, onSaved, onCancel }) {
  const isEditing = Boolean(project)
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
        video_url = await uploadMediaFile('videos', videoFile)
      }

      const payload = { title: form.title, description: form.description, image_url, video_url }

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
      setError(
        isEditing
          ? '작품 수정에 실패했어요. 입력하신 내용은 그대로 남아있으니 다시 시도해 주세요.'
          : '작품 등록에 실패했어요. 입력하신 내용은 그대로 남아있으니 다시 시도해 주세요.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label className="admin-form__field">
        <span>제목</span>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          required
        />
      </label>

      <label className="admin-form__field">
        <span>설명</span>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </label>

      <label className="admin-form__field">
        <span>이미지 파일 {isEditing && '(바꿀 때만 선택)'}</span>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
      </label>

      <label className="admin-form__field">
        <span>영상 파일 {isEditing && '(바꿀 때만 선택)'}</span>
        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
      </label>

      {error && <p className="admin-form__error">{error}</p>}

      <div className="admin-form__actions">
        <button type="submit" disabled={submitting}>
          {submitting ? '저장 중…' : isEditing ? '수정 저장' : '작품 등록'}
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

export default AdminProjectForm
