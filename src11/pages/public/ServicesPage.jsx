import React from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/layout/Navbar'
import { Calendar, FileText, Pill, Activity, Users, BarChart } from 'lucide-react'

const services = [
  { icon: Calendar, title: 'Appointment Management', desc: 'Streamline scheduling with smart conflict detection and automated reminders.' },
  { icon: FileText, title: 'Digital Prescriptions', desc: 'Issue and manage prescriptions digitally with medicine stock integration.' },
  { icon: Pill, title: 'Pharmacy & Inventory', desc: 'Track medicine stock levels, auto-deduct on prescription, prevent stockouts.' },
  { icon: Activity, title: 'Patient Vitals Tracking', desc: 'Real-time vitals monitoring with historical trends and nurse ward management.' },
  { icon: Users, title: 'Staff Management', desc: 'Manage doctors, nurses, and departments with role-based access control.' },
  { icon: BarChart, title: 'Revenue Analytics', desc: 'Comprehensive billing, payment tracking, and revenue reports for administrators.' },
]

const ServicesPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar />
    <div className="max-w-6xl mx-auto px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Our <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Services</span></h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Comprehensive healthcare management solutions</p>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div key={s.title} className="glass-card p-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.02, y: -4 }}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <s.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">{s.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
)

export default ServicesPage
