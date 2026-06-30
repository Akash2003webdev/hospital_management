import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, FileText, Users } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import DoctorHome from './DoctorHome'
import DoctorAppointments from './DoctorAppointments'
import DoctorPrescriptions from './DoctorPrescriptions'
import DoctorPatients from './DoctorPatients'

const links = [
  { label: 'Overview', to: '/doctor-dashboard', icon: LayoutDashboard },
  { label: 'Appointments', to: '/doctor-dashboard/appointments', icon: Calendar },
  { label: 'Prescriptions', to: '/doctor-dashboard/prescriptions', icon: FileText },
  { label: 'My Patients', to: '/doctor-dashboard/patients', icon: Users },
]

const DoctorDashboard = () => (
  <DashboardLayout links={links} title="Doctor Dashboard">
    <Routes>
      <Route index element={<DoctorHome />} />
      <Route path="appointments" element={<DoctorAppointments />} />
      <Route path="prescriptions" element={<DoctorPrescriptions />} />
      <Route path="patients" element={<DoctorPatients />} />
      <Route path="*" element={<Navigate to="/doctor-dashboard" replace />} />
    </Routes>
  </DashboardLayout>
)

export default DoctorDashboard
