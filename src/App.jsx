import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import DashboardPage from './pages/DashboardPage'
import AppointmentsPage from './pages/AppointmentsPage'
import PricesPage from './pages/PricesPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/agenda" element={<AppointmentsPage />} />
        <Route path="/precios" element={<PricesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
