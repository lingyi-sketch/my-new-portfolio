import { profile } from '../data/works'
import './Profile.css'

function Profile() {
  return (
    <div className="page-enter profile-page container">
      <span className="eyebrow">Profile</span>
      <h1 className="profile-page__name">{profile.name}</h1>
      <p className="quote profile-page__quote">{profile.subtitle}</p>

      <div className="profile-page__grid">
        <div className="profile-page__left">
          <div className="profile-page__text">
            <p className="profile-page__intro">{profile.intro}</p>
            <p className="profile-page__bio">{profile.bio}</p>
          </div>
          <a className="profile-page__email" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </div>

        <div className="profile-page__right">
          <p className="profile-page__aphorism">{profile.aphorism}</p>
        </div>
      </div>
    </div>
  )
}

export default Profile
