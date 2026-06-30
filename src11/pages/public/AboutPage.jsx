import React from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/layout/Navbar'
import { Award, Target, Users } from 'lucide-react'

const AboutPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Navbar />
    <div className="max-w-5xl mx-auto px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">About <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MediCare HMS</span></h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">We're building the future of hospital management with cutting-edge technology and patient-first principles.</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: Target, title: 'Our Mission', desc: 'To empower healthcare providers with intelligent tools that streamline operations and improve patient outcomes.' },
          { icon: Award, title: 'Our Values', desc: 'We believe in transparency, innovation, and putting patients at the center of everything we do.' },
          { icon: Users, title: 'Our Team', desc: 'A dedicated team of healthcare professionals, engineers, and designers working to transform healthcare delivery.' },
        ].map((item, i) => (
          <motion.div key={item.title} className="glass-card p-8 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <item.icon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
)

export default AboutPage
