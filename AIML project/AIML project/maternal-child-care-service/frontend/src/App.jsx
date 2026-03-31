import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import MotherLogin from './components/MotherLogin'
import StaffLogin from './components/StaffLogin'
import RegisterMother from './components/RegisterMother'
import MotherDashboard from './components/MotherDashboard'
import ChildDashboard from './components/ChildDashboard'
import DoctorDashboard from './components/DoctorDashboard'
import MidwifeDashboard from './components/MidwifeDashboard'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/mother-login" element={<MotherLogin />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/register-mother" element={<RegisterMother />} />
        
        {/* Mother Dashboard Routes */}
        <Route path="/mother/*" element={<MotherDashboard />} />
        
        {/* Child Dashboard Routes */}
        <Route path="/child/*" element={<ChildDashboard />} />
        
        {/* Doctor Dashboard Routes */}
        <Route path="/doctor/*" element={<DoctorDashboard />} />
        
        {/* Midwife Dashboard Routes */}
        <Route path="/midwife/*" element={<MidwifeDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
