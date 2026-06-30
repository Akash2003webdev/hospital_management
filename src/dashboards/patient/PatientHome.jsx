import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, FileText, CreditCard, Clock } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

const PatientHome = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ appointments: 0, prescriptions: 0, pendingBills: 0, upcoming: 0 })
  const [recentAppts, setRecentAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()
      if (!patient) return setLoading(false)

      const today = new Date().toISOString().split('T')[0]
      const [{ count: appts }, { count: upcoming }, { data: apptData }] = await Promise.all([
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('patient_id', patient.id),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('patient_id', patient.id).gte('date', today).neq('status', 'cancelled'),
        supabase.from('appointments').select('*, doctors(*, users(name))').eq('patient_id', patient.id).order('date', { ascending: false }).limit(5),
      ])

      const { data: billData } = await supabase.from('bills').select('*, appointments!inner(patient_id)').eq('appointments.patient_id', patient.id).eq('payment_status', 'unpaid')

      setStats({ appointments: appts || 0, upcoming: upcoming || 0, pendingBills: billData?.length || 0, prescriptions: 0 })
      setRecentAppts(apptData || [])
      setLoading(false)
    }
    load()
  }, [user])

  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your health summary</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Appointments', value: stats.appointments, icon: Calendar, color: 'from-blue-500 to-indigo-600' },
          { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'from-violet-500 to-purple-600' },
          { label: 'Pending Bills', value: stats.pendingBills, icon: CreditCard, color: 'from-orange-500 to-amber-600' },
          { label: 'Prescriptions', value: stats.prescriptions, icon: FileText, color: 'from-emerald-500 to-teal-600' },
        ].map((card, i) => (
          <motion.div key={card.label} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                {loading ? <div className="shimmer h-7 w-12 mt-1" /> : <p className="text-2xl font-bold mt-1">{card.value}</p>}
              </div>
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div className="glass-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h3 className="text-lg font-bold mb-4">Recent Appointments</h3>
        {recentAppts.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No appointments yet</p>
        ) : (
          <div className="space-y-3">
            {recentAppts.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div>
                  <p className="font-semibold">{a.doctors?.users?.name || 'Doctor'}</p>
                  <p className="text-xs text-gray-500">{a.date} at {a.time}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${STATUS_COLORS[a.status]}`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PatientHome
