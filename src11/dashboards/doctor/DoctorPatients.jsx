import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const DoctorPatients = () => {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).single()
      if (!doc) return setLoading(false)
      const { data: appts } = await supabase.from('appointments').select('*, patients(*, users(name, email))').eq('doctor_id', doc.id).neq('status', 'cancelled')
      const uniquePatients = []
      const seen = new Set()
      appts?.forEach(a => { if (a.patients && !seen.has(a.patient_id)) { seen.add(a.patient_id); uniquePatients.push(a.patients) } })
      setPatients(uniquePatients)
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Patients</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{patients.length} assigned patients</p>
      </div>
      {loading ? <LoadingSpinner /> : patients.length === 0 ? <EmptyState title="No patients yet" icon={Users} description="Patients will appear here after confirmed appointments" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p, i) => (
            <motion.div key={p.id} className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.02 }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">{p.users?.name?.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{p.users?.name}</p>
                  <p className="text-xs text-gray-500">{p.users?.email}</p>
                  <div className="flex gap-2 mt-1 text-xs text-gray-500">
                    {p.age && <span>Age: {p.age}</span>}
                    {p.gender && <span>• {p.gender}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorPatients
