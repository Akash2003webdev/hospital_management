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

  const roleColors = {
    admin: 'from-violet-500 to-indigo-600',
    doctor: 'from-sky-500 to-blue-600',
    nurse: 'from-emerald-500 to-teal-600',
    patient: 'from-rose-500 to-pink-600',
  }
  const roleGrad = roleColors[profile?.role] || 'from-sky-500 to-blue-600'

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-sky-500/30">
            <Activity className="h-4.5 w-4.5 text-white" style={{width:'18px',height:'18px'}} />
          </div>
          <div>
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">MediCare</span>
            <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-widest uppercase -mt-0.5">HMS</span>
          </div>
        </Link>
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Profile */}
      {profile && (
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleGrad} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
              {profile.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{profile.name}</p>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 capitalize tracking-wide">
                {profile.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-label">Navigation</p>
        {links.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
          >
            <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{width:'18px',height:'18px'}} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <motion.aside
        className="hidden lg:flex flex-col w-60 h-screen sticky top-0 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
        initial={{ x: -240 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
          />
          <motion.aside
            className="relative w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-10"
            initial={{ x: -256 }}
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
