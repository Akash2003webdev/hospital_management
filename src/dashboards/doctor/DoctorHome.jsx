import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

const DoctorHome = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, today: 0, completed: 0, patients: 0 })
  const [upcomingAppts, setUpcomingAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: doctorData } = await supabase.from('doctors').select('id').eq('user_id', user.id).single()
      if (!doctorData) return setLoading(false)
      const doctorId = doctorData.id
      const today = new Date().toISOString().split('T')[0]

      const [{ count: total }, { count: todayCount }, { count: completed }, { data: appts }] = await Promise.all([
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', doctorId),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', doctorId).eq('date', today),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', doctorId).eq('status', 'completed'),
        supabase.from('appointments').select('*, patients(*, users(name))').eq('doctor_id', doctorId).gte('date', today).neq('status', 'cancelled').order('date').limit(5),
      ])

      const patientIds = [...new Set(appts?.map(a => a.patient_id) || [])]
      setStats({ total: total || 0, today: todayCount || 0, completed: completed || 0, patients: patientIds.length })
      setUpcomingAppts(appts || [])
      setLoading(false)
    }
    load()
  }, [user])

  const statCards = [
    { label: 'Total Appointments', value: stats.total, icon: Calendar, color: 'from-blue-500 to-indigo-600' },
    { label: "Today's Appointments", value: stats.today, icon: Clock, color: 'from-violet-500 to-purple-600' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
    { label: 'My Patients', value: stats.patients, icon: Users, color: 'from-orange-500 to-amber-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Overview</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your appointments and patient summary</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.02 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                {loading ? <div className="shimmer h-7 w-16 mt-1" /> : <p className="text-2xl font-extrabold mt-1">{card.value}</p>}
              </div>
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div className="glass-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h3 className="text-lg font-bold mb-4">Upcoming Appointments</h3>
        {upcomingAppts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {upcomingAppts.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {a.patients?.users?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{a.patients?.users?.name}</p>
                    <p className="text-xs text-gray-500">{a.date} at {a.time}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${a.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default DoctorHome
