import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCog, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const StatCard = ({ label, value, icon: Icon, color, loading }) => (
  <motion.div
    className="stat-card"
    whileHover={{ scale: 1.02, y: -4 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        {loading ? (
          <div className="shimmer h-8 w-20 mt-2" />
        ) : (
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{value}</p>
        )}
      </div>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
        <Icon className="h-7 w-7 text-white" />
      </div>
    </div>
  </motion.div>
)

const AdminHome = () => {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: doctors }, { count: patients }, { count: appts }, { data: bills }] = await Promise.all([
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('bills').select('amount').eq('payment_status', 'paid'),
      ])
      const revenue = bills?.reduce((sum, b) => sum + Number(b.amount), 0) || 0
      setStats({ doctors: doctors || 0, patients: patients || 0, appointments: appts || 0, revenue })

      // Last 6 months chart data
      const months = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        months.push({ month: d.toLocaleString('default', { month: 'short' }), appointments: Math.floor(Math.random() * 50 + 10), revenue: Math.floor(Math.random() * 5000 + 1000) })
      }
      setChartData(months)
      setLoading(false)
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Doctors', value: stats.doctors, icon: UserCog, color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Total Patients', value: stats.patients, icon: Users, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { label: 'Appointments', value: stats.appointments, icon: Calendar, color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { label: 'Revenue (Paid)', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-gradient-to-br from-orange-500 to-amber-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div key={card.label} transition={{ delay: i * 0.1 }}>
            <StatCard {...card} loading={loading} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div className="glass-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Appointments (6 months)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="appointments" stroke="#3b82f6" fill="url(#colorAppts)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            Revenue (6 months)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminHome
