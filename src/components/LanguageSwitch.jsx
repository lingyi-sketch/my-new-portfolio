import { useLanguage } from '../i18n/LanguageContext'
import { LANGUAGES } from '../i18n/messages'
import './LanguageSwitch.css'

function LanguageSwitch() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div className="lang-switch" role="group" aria-label={t('lang.label')}>
      <svg className="lang-switch__globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9S14.6 18.4 12 21c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3Z" />
      </svg>
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          className={`lang-switch__button${lang === language.code ? ' lang-switch__button--active' : ''}`}
          aria-pressed={lang === language.code}
          aria-label={language.name}
          title={language.name}
          onClick={() => setLang(language.code)}
        >
          {language.short}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitch
