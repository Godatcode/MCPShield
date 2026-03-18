import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import WaitlistAdmin from './pages/WaitlistAdmin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Admin waitlist dashboard — hidden route, not linked publicly */}
        <Route path="/admin/waitlist" element={<WaitlistAdmin />} />
        {/* Redirect /app to landing page */}
        <Route path="/app/*" element={<Navigate to="/" replace />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
