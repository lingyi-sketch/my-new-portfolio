import { NavLink } from 'react-router-dom'
import { categories } from '../data/works'
import { useNavOrder } from '../hooks/useNavOrder'
import { sortByOrder } from '../lib/navOrder'
import './Navbar.css'

function Navbar() {
  const items = sortByOrder(categories, useNavOrder())

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/admin" className="navbar__brand">
          링이
        </NavLink>
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
