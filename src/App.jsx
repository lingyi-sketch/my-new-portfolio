import { Outlet, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import { profile } from './data/works'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container app-footer__inner">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <div className="app-footer__right">
            <span>Generative Cinema Studies</span>
            <Link to="/admin" className="app-footer__admin">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
