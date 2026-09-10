import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Videos from './pages/Videos.jsx'
import Pages from './pages/Pages.jsx'
import Profile from './pages/Profile.jsx'
import WorkDetail from './pages/WorkDetail.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="videos" element={<Videos />} />
          <Route path="pages" element={<Pages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="work/:id" element={<WorkDetail />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
