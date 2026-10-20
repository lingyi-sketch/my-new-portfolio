import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import { profile } from './data/works'
import './App.css'

// Which colour tint a route uses (the palettes live in index.css).
function pageKey(pathname) {
  const first = pathname.split('/')[1]
  if (first === 'script' || first === 'video' || first === 'game') return first
  if (first === 'assignments') return 'assignments'
  return 'profile'
}

function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.documentElement.dataset.page = pageKey(pathname)
  }, [pathname])

  return (
    <>
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container app-footer__inner">
          <span>© {new Date().getFullYear()} {profile.name}</span>
        </div>
      </footer>
    </>
  )
}

export default App
