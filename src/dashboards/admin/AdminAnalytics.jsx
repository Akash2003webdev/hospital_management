import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../services/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const AdminAnalytics = () => {
  const [data, setData] = useState({ appointments: [], status: [], revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: appts }, { data: bills }] = await Promise.all([
        supabase.from('appointments').select('status, date'),
        supabase.from('bills').select('amount, payment_status'),
      ])

      const statusCount = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
      appts?.forEach(a => { if (statusCount[a.status] !== undefined) statusCount[a.status]++ })

      const statusChartData = Object.entries(statusCount).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      const rev = bills?.filter(b => b.payment_status === 'paid').reduce((s, b) => s + Number(b.amount), 0) || 0

      // Monthly distribution
      const monthlyMap = {}
      appts?.forEach(a => {
        const month = new Date(a.date).toLocaleString('default', { month: 'short' })
        monthlyMap[month] = (monthlyMap[month] || 0) + 1
      })
      const monthly = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }))

      setData({ appointments: monthly, status: statusChartData, revenue: rev })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Hospital performance insights</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-lg font-bold mb-4">Monthly Appointments</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.appointments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-lg font-bold mb-4">Appointment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.status} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {data.status.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div className="glass-card p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Total Revenue (Paid Bills)</p>
        <p className="text-5xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">${data.revenue.toLocaleString()}</p>
      </motion.div>
    </div>
  )
}

export default AdminAnalytics
