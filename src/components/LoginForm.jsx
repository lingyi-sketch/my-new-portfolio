import { useState } from 'react'
import { signInAdmin } from '../lib/auth'
import './LoginForm.css'

function LoginForm() {
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
      setError('로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-form__field">
        <span>이메일</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="login-form__field">
        <span>비밀번호</span>
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
        {submitting ? '로그인 중…' : '로그인'}
      </button>
    </form>
  )
}

export default LoginForm
