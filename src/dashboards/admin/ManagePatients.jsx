import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, Trash2, Eye } from 'lucide-react'
import { supabase } from '../../services/supabase'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 8

const ManagePatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [viewPatient, setViewPatient] = useState(null)

  const fetchPatients = async () => {
    setLoading(true)
    const { data } = await supabase.from('patients').select('*, users(name, email)').order('created_at', { ascending: false })
    setPatients(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPatients() }, [])

  const filtered = patients.filter(p => p.users?.name?.toLowerCase().includes(search.toLowerCase()) || p.users?.email?.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleDelete = async (patient) => {
    const { count } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('patient_id', patient.id).neq('status', 'cancelled')
    if (count > 0) return toast.error('Cannot delete patient with active appointments')
    if (!window.confirm('Delete this patient?')) return
    await supabase.from('patients').delete().eq('id', patient.id)
    toast.success('Patient deleted')
    fetchPatients()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Patients</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{patients.length} total patients</p>
        </div>
      </div>
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input-field pl-11" placeholder="Search patients..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        {loading ? <LoadingSpinner /> : paginated.length === 0 ? (
          <EmptyState title="No patients found" icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Name', 'Email', 'Age', 'Gender', 'Phone', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginated.map(p => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">{p.users?.name?.charAt(0) || 'P'}</div>
                        <span className="font-medium text-gray-900 dark:text-white">{p.users?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{p.users?.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{p.age || '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 capitalize">{p.gender || '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{p.phone || '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewPatient(p)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="p-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
          </div>
        )}
      </div>

      <Modal isOpen={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details">
        {viewPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {viewPatient.users?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <h3 className="text-xl font-bold">{viewPatient.users?.name}</h3>
                <p className="text-gray-500">{viewPatient.users?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['Age', viewPatient.age || '—'], ['Gender', viewPatient.gender || '—'], ['Phone', viewPatient.phone || '—']].map(([k, v]) => (
                <div key={k} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold">{k}</p>
                  <p className="font-semibold capitalize mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ManagePatients
