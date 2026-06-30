import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LayoutDashboard, Users, UserCog, Briefcase, Calendar, Pill, BarChart, Building2, FileText } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import AdminHome from './AdminHome'
import ManageDoctors from './ManageDoctors'
import ManageNurses from './ManageNurses'
import ManagePatients from './ManagePatients'
import ManageDepartments from './ManageDepartments'
import ManageAppointments from './ManageAppointments'
import ManageMedicines from './ManageMedicines'
import AdminBilling from './AdminBilling'
import AdminAnalytics from './AdminAnalytics'

const links = [
  { label: 'Overview', to: '/admin-dashboard', icon: LayoutDashboard },
  { label: 'Doctors', to: '/admin-dashboard/doctors', icon: UserCog },
  { label: 'Nurses', to: '/admin-dashboard/nurses', icon: Users },
  { label: 'Patients', to: '/admin-dashboard/patients', icon: Users },
  { label: 'Departments', to: '/admin-dashboard/departments', icon: Building2 },
  { label: 'Appointments', to: '/admin-dashboard/appointments', icon: Calendar },
  { label: 'Medicines', to: '/admin-dashboard/medicines', icon: Pill },
  { label: 'Billing', to: '/admin-dashboard/billing', icon: FileText },
  { label: 'Analytics', to: '/admin-dashboard/analytics', icon: BarChart },
]

const AdminDashboard = () => (
  <DashboardLayout links={links} title="Admin Dashboard">
    <Routes>
      <Route index element={<AdminHome />} />
      <Route path="doctors" element={<ManageDoctors />} />
      <Route path="nurses" element={<ManageNurses />} />
      <Route path="patients" element={<ManagePatients />} />
      <Route path="departments" element={<ManageDepartments />} />
      <Route path="appointments" element={<ManageAppointments />} />
      <Route path="medicines" element={<ManageMedicines />} />
      <Route path="billing" element={<AdminBilling />} />
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
    </Routes>
  </DashboardLayout>
)

export default AdminDashboard
