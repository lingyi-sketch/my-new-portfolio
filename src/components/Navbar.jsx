import { NavLink } from 'react-router-dom'
import { categories } from '../data/works'
import { useNavOrder } from '../hooks/useNavOrder'
import { sortByOrder } from '../lib/navOrder'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitch from './LanguageSwitch'
import './Navbar.css'

function Navbar() {
  const { t } = useLanguage()
  const items = sortByOrder(categories, useNavOrder())

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/admin" className="navbar__brand">
          링이
        </NavLink>
        <div className="navbar__right">
          <nav className="navbar__nav">
            <ul>
              {items.map((cat) => (
                <li key={cat.key}>
                  <NavLink
                    to={cat.path}
                    end={cat.path === '/'}
                    className={({ isActive }) =>
                      'navbar__link' + (isActive ? ' navbar__link--active' : '')
                    }
                  >
                    {t(`nav.${cat.key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitch />
        </div>
      </div>
    </header>
  )
}

export default Navbar
