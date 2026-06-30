import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search } from 'lucide-react'
import { supabase } from '../../services/supabase'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const NursePatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('patients').select('*, users(name, email)').order('created_at', { ascending: false })
      setPatients(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = patients.filter(p => p.users?.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ward Patients</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{patients.length} patients</p>
      </div>
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input-field pl-11" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState title="No patients" icon={Users} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div key={p.id} className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">{p.users?.name?.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{p.users?.name}</p>
                  <p className="text-xs text-gray-500">{p.users?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[['Age', p.age || '—'], ['Gender', p.gender || '—'], ['Phone', p.phone || '—']].map(([k, v]) => (
                  <div key={k} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-xs text-gray-500">{k}</p>
                    <p className="text-sm font-semibold capitalize">{v}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NursePatients
