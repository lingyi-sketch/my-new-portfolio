import { profile } from '../data/works'
import './Profile.css'

function Profile() {
  return (
    <div className="page-enter profile-page container">
      <span className="eyebrow">Profile</span>
      <h1 className="profile-page__name">{profile.name}</h1>
      <p className="quote profile-page__quote">&ldquo;{profile.intro}&rdquo;</p>

      <div className="profile-page__grid">
        <p className="profile-page__bio">{profile.bio}</p>

        <div className="profile-page__contact">
          <span className="eyebrow">Contact</span>
          <a className="profile-page__email" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </div>
      </div>
    </div>
  )
}

export default Profile
