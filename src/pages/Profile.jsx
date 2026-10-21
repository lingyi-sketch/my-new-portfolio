import { useProfile } from '../hooks/useProfile'
import { useLanguage } from '../i18n/LanguageContext'
import { pickProfileText } from '../data/works'
import SmartImage from '../components/SmartImage'
import './Profile.css'

function contactHref(value) {
  if (/^https?:\/\//i.test(value)) return value
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`
  return null
}

function Contact({ contact }) {
  const href = contactHref(contact.value)

  return (
    <div className="profile-page__contact">
      {contact.label && <span className="profile-page__contact-label">{contact.label}</span>}
      {href ? (
        <a className="profile-page__email" href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
          {contact.value}
        </a>
      ) : (
        <span className="profile-page__contact-text">{contact.value}</span>
      )}
    </div>
  )
}

function Profile() {
  const { lang, t } = useLanguage()
  const { status, content, photos } = useProfile()

  if (status === 'loading') {
    return (
      <div className="page-enter profile-page container">
        <p className="profile-page__status">{t('profile.loading')}</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="page-enter profile-page container">
        <p className="profile-page__status profile-page__status--error">{t('profile.error')}</p>
      </div>
    )
  }

  const contacts = (content.contacts ?? []).filter((contact) => contact.value)
  const text = (field) => pickProfileText(content, lang, field)

  return (
    <div className="page-enter profile-page container">
      <span className="eyebrow">{t('profile.eyebrow')}</span>
      <h1 className="profile-page__name">{content.name}</h1>
      <p className="quote profile-page__quote">{text('subtitle')}</p>

      <div className="profile-page__grid">
        {(text('intro') || text('bio')) && (
          <div className="color-panel profile-page__panel--mint">
            <div className="profile-page__text">
              {text('intro') && <p className="profile-page__intro">{text('intro')}</p>}
              {text('bio') && <p className="profile-page__bio">{text('bio')}</p>}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div className="color-panel profile-page__panel--pink">
            <div className="profile-page__photos">
              {photos.map((photo) => (
                <div key={photo.id} className="profile-page__photo">
                  <SmartImage src={photo.image_url} alt={content.name} label="" hoverEffect={false} color />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="color-panel profile-page__panel--coffee">
          <div className="profile-page__bottom">
            <div className="profile-page__contacts">
              {contacts.map((contact, i) => (
                <Contact key={`${contact.value}-${i}`} contact={contact} />
              ))}
            </div>

            <div className="profile-page__right">
              {text('aphorism') && <p className="profile-page__aphorism">{text('aphorism')}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
