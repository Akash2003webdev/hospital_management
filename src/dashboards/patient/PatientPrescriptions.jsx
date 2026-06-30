import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const PatientPrescriptions = () => {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()
      if (!patient) return setLoading(false)
      const { data } = await supabase.from('prescriptions').select('*, appointments(*, patients(id)), doctors(*, users(name))').order('created_at', { ascending: false })
      // Filter only prescriptions for this patient's appointments
      const filtered = data?.filter(p => p.appointments?.patients?.id === patient.id) || []
      setPrescriptions(filtered)
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Prescriptions</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{prescriptions.length} prescriptions</p>
      </div>
      {loading ? <LoadingSpinner /> : prescriptions.length === 0 ? <EmptyState title="No prescriptions" icon={FileText} description="Your prescriptions will appear here after doctor visits" /> : (
        <div className="space-y-4">
          {prescriptions.map((p, i) => (
            <motion.div key={p.id} className="glass-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Dr. {p.doctors?.users?.name}</p>
                  <p className="text-xs text-gray-500">{p.appointments?.date} at {p.appointments?.time}</p>
                </div>
                <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{p.notes}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PatientPrescriptions
