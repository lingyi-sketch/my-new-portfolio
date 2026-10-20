import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LANGUAGE, LANGUAGES, messages } from './messages'
import { fetchTextOverrides } from '../lib/textOverrides'

const STORAGE_KEY = 'lang'
const LanguageContext = createContext(null)

function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return LANGUAGES.some((language) => language.code === stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLanguage)

  useEffect(() => {
    document.documentElement.lang = LANGUAGES.find((language) => language.code === lang)?.htmlLang ?? lang
  }, [lang])

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // storage can be unavailable (private mode); the choice still applies for this visit
    }
  }, [])

  // Texts the admin edited from the dashboard; they win over the built-in messages.
  const [overrides, setOverrides] = useState({})

  useEffect(() => {
    let cancelled = false
    fetchTextOverrides()
      .then((loaded) => {
        if (!cancelled) setOverrides(loaded)
      })
      .catch(() => {
        // without the database the built-in texts are used as they are
      })
    return () => {
      cancelled = true
    }
  }, [])

  const t = useCallback(
    (key, vars) => {
      const entry = messages[key]
      const edited = overrides[key]?.[lang]
      const template = (typeof edited === 'string' && edited.trim() ? edited : null) ?? entry?.[lang] ?? entry?.ko ?? key
      if (!vars) return template
      return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match))
    },
    [lang, overrides],
  )

  const value = useMemo(() => ({ lang, setLang, t, overrides, setOverrides }), [lang, setLang, t, overrides])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside <LanguageProvider>')
  }
  return context
}
