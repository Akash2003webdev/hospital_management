import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LayoutDashboard, Users, Heart } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import NurseHome from './NurseHome'
import NursePatients from './NursePatients'
import NurseVitals from './NurseVitals'

const links = [
  { label: 'Overview', to: '/nurse-dashboard', icon: LayoutDashboard },
  { label: 'Ward Patients', to: '/nurse-dashboard/patients', icon: Users },
  { label: 'Vitals', to: '/nurse-dashboard/vitals', icon: Heart },
]

const NurseDashboard = () => (
  <DashboardLayout links={links} title="Nurse Dashboard">
    <Routes>
      <Route index element={<NurseHome />} />
      <Route path="patients" element={<NursePatients />} />
      <Route path="vitals" element={<NurseVitals />} />
      <Route path="*" element={<Navigate to="/nurse-dashboard" replace />} />
    </Routes>
  </DashboardLayout>
)

export default NurseDashboard
