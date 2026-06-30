import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, LogOut, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Sidebar = ({ links, isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, profile } = useAuth()

  const handleLogout = async () => {
    await signOut()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MediCare</span>
        </Link>
        <button className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {profile && (
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {profile.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-[140px]">{profile.name}</p>
              <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full capitalize">
                {profile.role}
              </span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col w-64 h-screen sticky top-0 glass-card rounded-none border-y-0 border-l-0"
        initial={{ x: -264 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
          />
          <motion.aside
            className="relative w-72 h-full glass-card rounded-none border-y-0 border-l-0 z-10"
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {sidebarContent}
          </motion.aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
