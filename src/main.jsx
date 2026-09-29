import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import VideoPage from './pages/VideoPage.jsx'
import ScriptPage from './pages/ScriptPage.jsx'
import GamePage from './pages/GamePage.jsx'
import Profile from './pages/Profile.jsx'
import Admin from './pages/Admin.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<VideoPage />} />
          <Route path="script" element={<ScriptPage />} />
          <Route path="game" element={<GamePage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<VideoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
