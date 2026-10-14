import { useEffect, useState } from 'react'
import {
  fetchProfile,
  fetchProfilePhotos,
  saveProfile,
  addProfilePhoto,
  deleteProfilePhoto,
} from '../lib/profile'
import { uploadMediaFile, deleteMediaFile } from '../lib/storage'
import { profile as defaultProfile } from '../data/works'
import SmartImage from './SmartImage'
import './AdminProjectForm.css'

const TEXT_FIELDS = [
  { key: 'name', label: '이름', rows: 1 },
  { key: 'subtitle', label: '이름 아래 문구', rows: 2 },
  { key: 'intro', label: '소개 문구', rows: 2 },
  { key: 'bio', label: '소개글', rows: 6 },
  { key: 'aphorism', label: '우측 하단 문구', rows: 3 },
]

function ProfileTextForm({ initial, onSaved }) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    subtitle: initial.subtitle ?? '',
    intro: initial.intro ?? '',
    bio: initial.bio ?? '',
    aphorism: initial.aphorism ?? '',
  })
  const [contacts, setContacts] = useState(
    (initial.contacts ?? []).map((contact) => ({ label: contact.label ?? '', value: contact.value ?? '' })),
  )
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)

  function updateContact(index, key, value) {
    setContacts((prev) => prev.map((contact, i) => (i === index ? { ...contact, [key]: value } : contact)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const saved = await saveProfile({
        ...form,
        contacts: contacts.filter((contact) => contact.value.trim()),
      })
      setMessage({ type: 'ok', text: '저장했어요. 프로필 페이지에 바로 반영돼요.' })
      onSaved?.(saved)
    } catch {
      setMessage({
        type: 'error',
        text: '저장에 실패했어요. 입력하신 내용은 그대로 남아있으니 다시 시도해 주세요.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {TEXT_FIELDS.map((field) => (
        <label key={field.key} className="admin-form__field">
          <span>{field.label}</span>
          <textarea
            rows={field.rows}
            value={form[field.key]}
            onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
          />
        </label>
      ))}

      <div className="admin-form__field">
        <span>연락처 (이메일 · 전화 · SNS 주소 등)</span>
        {contacts.map((contact, index) => (
          <div key={index} className="admin-contact-row">
            <input
              type="text"
              placeholder="이름 (선택)"
              value={contact.label}
              onChange={(e) => updateContact(index, 'label', e.target.value)}
            />
            <input
              type="text"
              placeholder="내용 (이메일, 전화번호, 링크)"
              value={contact.value}
              onChange={(e) => updateContact(index, 'value', e.target.value)}
            />
            <button
              type="button"
              className="admin-form__cancel"
              onClick={() => setContacts((prev) => prev.filter((_, i) => i !== index))}
            >
              삭제
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-form__cancel admin-form__add"
          onClick={() => setContacts((prev) => [...prev, { label: '', value: '' }])}
        >
          + 연락처 추가
        </button>
      </div>

      {message.text && (
        <p className={message.type === 'error' ? 'admin-form__error' : 'admin-form__ok'}>{message.text}</p>
      )}

      <div className="admin-form__actions">
        <button type="submit" disabled={saving}>
          {saving ? '저장 중…' : '프로필 저장'}
        </button>
      </div>
    </form>
  )
}

function ProfilePhotos() {
  const [photos, setPhotos] = useState([])
  const [status, setStatus] = useState('loading')
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [inputKey, setInputKey] = useState(0)

  async function load() {
    try {
      setPhotos(await fetchProfilePhotos())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleUpload(e) {
    e.preventDefault()
    if (files.length === 0) return
    setUploading(true)
    setError('')
    const failed = []
    for (const file of files) {
      let url = null
      try {
        url = await uploadMediaFile('images', file)
        await addProfilePhoto(url)
      } catch {
        failed.push(file)
        if (url) await deleteMediaFile(url)
      }
    }
    await load()
    setFiles(failed)
    if (failed.length === 0) {
      setInputKey((key) => key + 1)
    } else {
      setError(`${failed.length}장을 올리지 못했어요. 선택한 파일은 그대로 남아있으니 다시 시도해 주세요.`)
    }
    setUploading(false)
  }

  async function confirmDelete(photo) {
    setDeleting(true)
    setError('')
    try {
      await deleteProfilePhoto(photo)
      setPendingDeleteId(null)
      await load()
    } catch {
      setError('삭제에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <form className="admin-form" onSubmit={handleUpload}>
        <label className="admin-form__field">
          <span>사진 추가 (여러 장 선택 가능)</span>
          <input
            key={inputKey}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </label>
        {error && <p className="admin-form__error">{error}</p>}
        <div className="admin-form__actions">
          <button type="submit" disabled={uploading || files.length === 0}>
            {uploading ? '올리는 중…' : `사진 올리기${files.length ? ` (${files.length}장)` : ''}`}
          </button>
        </div>
      </form>

      {status === 'loading' && <p className="status-message">불러오는 중이에요…</p>}
      {status === 'error' && <p className="status-message status-message--error">사진 목록을 불러오지 못했어요.</p>}
      {status === 'ready' && photos.length === 0 && <p className="status-message">등록된 사진이 없어요.</p>}
      {status === 'ready' && photos.length > 0 && (
        <ul className="admin-photo-grid">
          {photos.map((photo) => (
            <li key={photo.id} className="admin-photo-grid__item">
              <div className="admin-photo-grid__thumb">
                <SmartImage src={photo.image_url} alt="프로필 사진" label="" hoverEffect={false} />
              </div>
              {pendingDeleteId === photo.id ? (
                <div className="admin-list__confirm">
                  <span>삭제할까요?</span>
                  <button type="button" onClick={() => confirmDelete(photo)} disabled={deleting}>
                    {deleting ? '삭제 중…' : '삭제'}
                  </button>
                  <button type="button" onClick={() => setPendingDeleteId(null)} disabled={deleting}>
                    취소
                  </button>
                </div>
              ) : (
                <button type="button" className="admin-photo-grid__delete" onClick={() => setPendingDeleteId(photo.id)}>
                  삭제
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function AdminProfileSection() {
  const [initial, setInitial] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetchProfile()
      .then((row) => {
        setInitial({ ...defaultProfile, ...(row ?? {}) })
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <>
      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">프로필 글 수정</h2>
        {status === 'loading' && <p className="status-message">불러오는 중이에요…</p>}
        {status === 'error' && (
          <p className="status-message status-message--error">프로필을 불러오지 못했어요.</p>
        )}
        {status === 'ready' && <ProfileTextForm initial={initial} />}
      </section>

      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">프로필 사진</h2>
        <ProfilePhotos />
      </section>
    </>
  )
}

export default AdminProfileSection
