import { NavLink } from 'react-router-dom'
import { categories, profile } from '../data/works'
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          {profile.name}
        </NavLink>
        <nav className="navbar__nav">
          <ul>
            {categories.map((cat) => (
              <li key={cat.key}>
                <NavLink
                  to={cat.path}
                  end={cat.path === '/'}
                  className={({ isActive }) =>
                    'navbar__link' + (isActive ? ' navbar__link--active' : '')
                  }
                >
                  {cat.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
