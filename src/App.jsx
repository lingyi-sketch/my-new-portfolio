import { Outlet } from 'react-router-dom'
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
          <span>Generative Cinema Studies</span>
        </div>
      </footer>
    </>
  )
}

export default App
