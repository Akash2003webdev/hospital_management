import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Building2, Heart } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

const NurseHome = () => {
  const { user } = useAuth()
  const [nurseInfo, setNurseInfo] = useState(null)
  const [patientCount, setPatientCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: nurse } = await supabase.from('nurses').select('*, departments(name)').eq('user_id', user.id).single()
      if (!nurse) return setLoading(false)
      setNurseInfo(nurse)
      if (nurse.department_id) {
        const { count } = await supabase.from('patients').select('*', { count: 'exact', head: true })
        setPatientCount(count || 0)
      }
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nurse Overview</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Ward and patient management</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Department', value: nurseInfo?.departments?.name || 'Not Assigned', icon: Building2, color: 'from-blue-500 to-indigo-600' },
          { label: 'Ward Patients', value: patientCount, icon: Users, color: 'from-emerald-500 to-teal-600' },
          { label: 'Vitals Today', value: '—', icon: Heart, color: 'from-rose-500 to-pink-600' },
        ].map((card, i) => (
          <motion.div key={card.label} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                {loading ? <div className="shimmer h-7 w-20 mt-1" /> : <p className="text-2xl font-bold mt-1">{card.value}</p>}
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default NurseHome
