import { useEffect, useState } from 'react'
import {
  fetchProfile,
  fetchProfilePhotos,
  saveProfile,
  addProfilePhoto,
  deleteProfilePhoto,
} from '../lib/profile'
import { uploadMediaFile, deleteMediaFile } from '../lib/storage'
import { saveOrder } from '../lib/ordering'
import { profile as defaultProfile, PROFILE_TEXT_FIELDS } from '../data/works'
import SmartImage from './SmartImage'
import SortableList from './SortableList'
import { useLanguage } from '../i18n/LanguageContext'
import { LANGUAGES } from '../i18n/messages'
import './AdminProjectForm.css'

const TEXT_FIELDS = [
  { key: 'name', rows: 1 },
  { key: 'subtitle', rows: 2 },
  { key: 'intro', rows: 2 },
  { key: 'bio', rows: 6 },
  { key: 'aphorism', rows: 3 },
]

const TRANSLATED_LANGS = ['zh', 'en']

function initialTexts(initial) {
  const texts = { ko: {}, zh: {}, en: {} }
  for (const field of PROFILE_TEXT_FIELDS) {
    texts.ko[field] = initial[field] ?? ''
    for (const lang of TRANSLATED_LANGS) {
      texts[lang][field] = initial.translations?.[lang]?.[field] ?? ''
    }
  }
  return texts
}

function ProfileTextForm({ initial, onSaved }) {
  const { lang, t } = useLanguage()
  const [name, setName] = useState(initial.name ?? '')
  const [texts, setTexts] = useState(() => initialTexts(initial))
  const [editLang, setEditLang] = useState(lang)
  const [contacts, setContacts] = useState(() =>
    (initial.contacts ?? []).map((contact) => ({
      id: crypto.randomUUID(),
      label: contact.label ?? '',
      value: contact.value ?? '',
    })),
  )
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)

  function updateContact(id, key, value) {
    setContacts((prev) => prev.map((contact) => (contact.id === id ? { ...contact, [key]: value } : contact)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const translations = {}
      for (const code of TRANSLATED_LANGS) {
        translations[code] = {}
        for (const field of PROFILE_TEXT_FIELDS) {
          translations[code][field] = texts[code][field].trim()
        }
      }
      const saved = await saveProfile({
        name,
        ...texts.ko,
        translations,
        contacts: contacts
          .filter((contact) => contact.value.trim())
          .map(({ label, value }) => ({ label, value })),
      })
      setMessage({ type: 'ok', text: t('admin.profile.saved') })
      onSaved?.(saved)
    } catch {
      setMessage({
        type: 'error',
        text: t('admin.profile.saveFailed'),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label className="admin-form__field">
        <span>{t('admin.profile.field.name')}</span>
        <textarea rows={1} value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <div className="admin-tabs" role="group" aria-label={t('lang.label')}>
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            type="button"
            className={`admin-tabs__item${editLang === language.code ? ' admin-tabs__item--active' : ''}`}
            aria-pressed={editLang === language.code}
            onClick={() => setEditLang(language.code)}
          >
            {language.name}
          </button>
        ))}
      </div>
      <p className="admin-hint">{t('admin.profile.langHint')}</p>

      {TEXT_FIELDS.filter((field) => field.key !== 'name').map((field) => (
        <label key={`${editLang}-${field.key}`} className="admin-form__field">
          <span>{t(`admin.profile.field.${field.key}`)}</span>
          <textarea
            rows={field.rows}
            value={texts[editLang][field.key]}
            onChange={(e) =>
              setTexts((prev) => ({
                ...prev,
                [editLang]: { ...prev[editLang], [field.key]: e.target.value },
              }))
            }
          />
        </label>
      ))}

      <div className="admin-form__field">
        <span>{t('admin.profile.contacts')}</span>
        <SortableList
          items={contacts}
          onReorder={setContacts}
          className="admin-contact-list"
          itemClassName="admin-contact-row"
          renderItem={(contact, handle) => (
            <>
              {handle}
              <input
                type="text"
                placeholder={t('admin.profile.contactLabelPh')}
                value={contact.label}
                onChange={(e) => updateContact(contact.id, 'label', e.target.value)}
              />
              <input
                type="text"
                placeholder={t('admin.profile.contactValuePh')}
                value={contact.value}
                onChange={(e) => updateContact(contact.id, 'value', e.target.value)}
              />
              <button
                type="button"
                className="admin-form__cancel"
                onClick={() => setContacts((prev) => prev.filter((item) => item.id !== contact.id))}
              >
                {t('common.delete')}
              </button>
            </>
          )}
        />
        <button
          type="button"
          className="admin-form__cancel admin-form__add"
          onClick={() =>
            setContacts((prev) => [...prev, { id: crypto.randomUUID(), label: '', value: '' }])
          }
        >
          {t('admin.profile.addContact')}
        </button>
      </div>

      {message.text && (
        <p className={message.type === 'error' ? 'admin-form__error' : 'admin-form__ok'}>{message.text}</p>
      )}

      <div className="admin-form__actions">
        <button type="submit" disabled={saving}>
          {saving ? t('common.saving') : t('admin.profile.save')}
        </button>
      </div>
    </form>
  )
}

function ProfilePhotos() {
  const { t } = useLanguage()
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
      setError(t('admin.profile.uploadFailed', { n: failed.length }))
    }
    setUploading(false)
  }

  async function reorder(next) {
    const previous = photos
    setPhotos(next)
    setError('')
    try {
      await saveOrder('site_profile_photos', next.map((photo) => photo.id))
    } catch {
      setPhotos(previous)
      setError(t('common.orderFailed'))
    }
  }

  async function confirmDelete(photo) {
    setDeleting(true)
    setError('')
    try {
      await deleteProfilePhoto(photo)
      setPendingDeleteId(null)
      await load()
    } catch {
      setError(t('common.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <form className="admin-form" onSubmit={handleUpload}>
        <label className="admin-form__field">
          <span>{t('admin.profile.addPhotos')}</span>
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
            {uploading
              ? t('admin.profile.uploading')
              : files.length
                ? t('admin.profile.uploadN', { n: files.length })
                : t('admin.profile.upload')}
          </button>
        </div>
      </form>

      {status === 'loading' && <p className="status-message">{t('common.loading')}</p>}
      {status === 'error' && <p className="status-message status-message--error">{t('admin.profile.photosLoadFailed')}</p>}
      {status === 'ready' && photos.length === 0 && <p className="status-message">{t('admin.profile.noPhotos')}</p>}
      {status === 'ready' && photos.length > 0 && (
        <>
          <p className="admin-hint">{t('admin.profile.photoHint')}</p>
          <SortableList
            items={photos}
            onReorder={reorder}
            grid
            className="admin-photo-grid"
            itemClassName="admin-photo-grid__item"
            renderItem={(photo, handle) => (
              <>
                <div className="admin-photo-grid__bar">{handle}</div>
                <div className="admin-photo-grid__thumb">
                  <SmartImage src={photo.image_url} alt={t('admin.profile.photoAlt')} label="" hoverEffect={false} color />
                </div>
                {pendingDeleteId === photo.id ? (
                  <div className="admin-list__confirm">
                    <span>{t('common.confirmDelete')}</span>
                    <button type="button" onClick={() => confirmDelete(photo)} disabled={deleting}>
                      {deleting ? t('common.deleting') : t('common.delete')}
                    </button>
                    <button type="button" onClick={() => setPendingDeleteId(null)} disabled={deleting}>
                      {t('common.cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="admin-photo-grid__delete"
                    onClick={() => setPendingDeleteId(photo.id)}
                  >
                    {t('common.delete')}
                  </button>
                )}
              </>
            )}
          />
        </>
      )}
    </>
  )
}

function AdminProfileSection() {
  const { t } = useLanguage()
  const [initial, setInitial] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetchProfile()
      .then((row) => {
        setInitial({ ...defaultProfile, ...(row ?? {}), translations: row?.translations ?? defaultProfile.translations })
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <>
      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{t('admin.profile.editTitle')}</h2>
        {status === 'loading' && <p className="status-message">{t('common.loading')}</p>}
        {status === 'error' && (
          <p className="status-message status-message--error">{t('admin.profile.loadFailed')}</p>
        )}
        {status === 'ready' && <ProfileTextForm initial={initial} />}
      </section>

      <section className="admin-page__section">
        <h2 className="admin-page__subtitle">{t('admin.profile.photos')}</h2>
        <ProfilePhotos />
      </section>
    </>
  )
}

export default AdminProfileSection
