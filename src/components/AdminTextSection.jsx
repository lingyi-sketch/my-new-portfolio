import { useState } from 'react'
import { LANGUAGES, messages } from '../i18n/messages'
import { useLanguage } from '../i18n/LanguageContext'
import { saveTextOverrides } from '../lib/textOverrides'
import './AdminTextSection.css'

// Visitor-facing texts, grouped by where they appear. Admin/login/common strings stay fixed.
const GROUPS = [
  { id: 'nav', labelKey: 'admin.text.group.nav', prefixes: ['nav.'] },
  { id: 'profile', labelKey: 'nav.profile', prefixes: ['profile.'] },
  { id: 'video', labelKey: 'nav.video', prefixes: ['video.'] },
  { id: 'script', labelKey: 'nav.script', prefixes: ['script.', 'docviewer.'] },
  { id: 'game', labelKey: 'nav.game', prefixes: ['game.'] },
  { id: 'assignments', labelKey: 'nav.assignments', prefixes: ['assignments.', 'assignment.'] },
]

const keysFor = (group) =>
  Object.keys(messages).filter(
    (key) => group.prefixes.some((prefix) => key.startsWith(prefix)) && !key.startsWith('assignment.kindForm.'),
  )

function AdminTextSection() {
  const { t, overrides, setOverrides } = useLanguage()
  const [drafts, setDrafts] = useState({})
  const [busyKey, setBusyKey] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const valueOf = (key, code) => drafts[key]?.[code] ?? overrides[key]?.[code] ?? ''

  function edit(key, code, value) {
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? overrides[key] ?? {}), [code]: value },
    }))
  }

  async function commit(key, entry) {
    const previous = overrides
    const next = { ...overrides }
    const cleaned = Object.fromEntries(
      LANGUAGES.map(({ code }) => [code, (entry?.[code] ?? '').trim()]).filter(([, text]) => text),
    )
    if (Object.keys(cleaned).length) next[key] = cleaned
    else delete next[key]

    setBusyKey(key)
    setMessage({ type: '', text: '' })
    try {
      await saveTextOverrides(next)
      setOverrides(next)
      setDrafts((prev) => {
        const { [key]: removed, ...rest } = prev
        return rest
      })
      setMessage({ type: 'ok', text: t('admin.text.saved') })
    } catch {
      setOverrides(previous)
      setMessage({ type: 'error', text: t('admin.text.saveFailed') })
    } finally {
      setBusyKey('')
    }
  }

  return (
    <section className="admin-page__section">
      <h2 className="admin-page__subtitle">{t('admin.text.title')}</h2>
      <p className="admin-hint">{t('admin.text.hint')}</p>

      {message.text && (
        <p className={message.type === 'error' ? 'status-message status-message--error' : 'admin-form__ok'}>
          {message.text}
        </p>
      )}

      {GROUPS.map((group) => (
        <details key={group.id} className="admin-text-group" open={group.id === 'nav'}>
          <summary>{t(group.labelKey)}</summary>
          {keysFor(group).map((key) => (
            <div key={key} className="admin-text-item">
              <code className="admin-text-item__key">{key}</code>
              <div className="admin-text-item__fields">
                {LANGUAGES.map(({ code, name }) => (
                  <label key={code} className="admin-form__field">
                    <span>{name}</span>
                    <input
                      type="text"
                      value={valueOf(key, code)}
                      placeholder={messages[key][code]}
                      onChange={(e) => edit(key, code, e.target.value)}
                    />
                  </label>
                ))}
              </div>
              <div className="admin-text-item__actions">
                <button
                  type="button"
                  disabled={busyKey === key || !drafts[key]}
                  onClick={() => commit(key, drafts[key])}
                >
                  {busyKey === key ? t('common.saving') : t('admin.text.save')}
                </button>
                {(overrides[key] || drafts[key]) && (
                  <button
                    type="button"
                    className="admin-form__cancel"
                    disabled={busyKey === key}
                    onClick={() => commit(key, {})}
                  >
                    {t('admin.text.reset')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </details>
      ))}
    </section>
  )
}

export default AdminTextSection
