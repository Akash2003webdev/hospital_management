import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Menu, X, Activity, LogOut } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme()
  const { user, profile, signOut, getDashboardRoute } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Services', to: '/services' },
    { label: 'Contact', to: '/contact' },
  ]

  return (
    <motion.nav
      className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800"
      style={{ boxShadow: '0 1px 0 rgba(15,23,42,0.05)' }}
      initial={{ y: -72 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 22 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-sky-500/30">
              <Activity className="h-4.5 w-4.5 text-white" style={{width:'18px',height:'18px'}} />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">MediCare </span>
              <span className="font-bold text-base bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">HMS</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'dark' : 'light'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark
                    ? <Sun className="h-4.5 w-4.5 text-amber-400" style={{width:'18px',height:'18px'}} />
                    : <Moon className="h-4.5 w-4.5 text-slate-500" style={{width:'18px',height:'18px'}} />
                  }
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => navigate(getDashboardRoute())}
                  className="btn-primary text-sm py-2"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 hover:border-red-200 dark:hover:border-red-800 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-flex btn-primary text-sm py-2">
                Sign In
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden py-4 border-t border-slate-100 dark:border-slate-800"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {user ? (
                    <>
                      <button onClick={() => { navigate(getDashboardRoute()); setMobileOpen(false) }} className="btn-primary text-sm">
                        Dashboard
                      </button>
                      <button onClick={handleLogout} className="btn-outline text-sm text-red-500 border-red-200">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center">
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
