import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, FileText, CreditCard, FlaskConical } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import PatientHome from './PatientHome'
import PatientAppointments from './PatientAppointments'
import PatientPrescriptions from './PatientPrescriptions'
import PatientBills from './PatientBills'
import PatientLabReports from './PatientLabReports'

const links = [
  { label: 'Overview', to: '/patient-dashboard', icon: LayoutDashboard },
  { label: 'Appointments', to: '/patient-dashboard/appointments', icon: Calendar },
  { label: 'Prescriptions', to: '/patient-dashboard/prescriptions', icon: FileText },
  { label: 'Bills', to: '/patient-dashboard/bills', icon: CreditCard },
  { label: 'Lab Reports', to: '/patient-dashboard/lab-reports', icon: FlaskConical },
]

const PatientDashboard = () => (
  <DashboardLayout links={links} title="Patient Dashboard">
    <Routes>
      <Route index element={<PatientHome />} />
      <Route path="appointments" element={<PatientAppointments />} />
      <Route path="prescriptions" element={<PatientPrescriptions />} />
      <Route path="bills" element={<PatientBills />} />
      <Route path="lab-reports" element={<PatientLabReports />} />
      <Route path="*" element={<Navigate to="/patient-dashboard" replace />} />
    </Routes>
  </DashboardLayout>
)

export default PatientDashboard
