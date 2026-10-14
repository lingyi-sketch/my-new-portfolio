import { useProfile } from '../hooks/useProfile'
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
  const { status, content, photos } = useProfile()

  if (status === 'loading') {
    return (
      <div className="page-enter profile-page container">
        <p className="profile-page__status">프로필을 불러오는 중이에요…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="page-enter profile-page container">
        <p className="profile-page__status profile-page__status--error">
          프로필을 불러오지 못했어요. 데이터베이스 연결을 확인한 뒤 다시 시도해 주세요.
        </p>
      </div>
    )
  }

  const contacts = (content.contacts ?? []).filter((contact) => contact.value)

  return (
    <div className="page-enter profile-page container">
      <span className="eyebrow">Profile</span>
      <h1 className="profile-page__name">{content.name}</h1>
      <p className="quote profile-page__quote">{content.subtitle}</p>

      <div className="profile-page__grid">
        <div className="profile-page__left">
          <div className="profile-page__text">
            {content.intro && <p className="profile-page__intro">{content.intro}</p>}
            {content.bio && <p className="profile-page__bio">{content.bio}</p>}
          </div>
          {contacts.length > 0 && (
            <div className="profile-page__contacts">
              {contacts.map((contact, i) => (
                <Contact key={`${contact.value}-${i}`} contact={contact} />
              ))}
            </div>
          )}
        </div>

        <div className="profile-page__right">
          {content.aphorism && <p className="profile-page__aphorism">{content.aphorism}</p>}
        </div>
      </div>

      {photos.length > 0 && (
        <div className="profile-page__photos">
          {photos.map((photo) => (
            <div key={photo.id} className="profile-page__photo">
              <SmartImage src={photo.image_url} alt={content.name} label="" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile
