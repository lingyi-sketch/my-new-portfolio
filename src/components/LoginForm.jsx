import { useState } from 'react'
import { signInAdmin } from '../lib/auth'
import { useLanguage } from '../i18n/LanguageContext'
import './LoginForm.css'

function LoginForm() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signInAdmin(email, password)
    } catch {
      setError(t('login.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-form__field">
        <span>{t('login.email')}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="login-form__field">
        <span>{t('login.password')}</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="login-form__error">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? t('login.submitting') : t('login.submit')}
      </button>
    </form>
  )
}

export default LoginForm
