import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Search } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}
const ITEMS_PER_PAGE = 10

const DoctorAppointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [doctorId, setDoctorId] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).single()
      if (doc) { setDoctorId(doc.id); fetchAppointments(doc.id) }
      else setLoading(false)
    }
    load()
  }, [user])

  const fetchAppointments = async (dId) => {
    setLoading(true)
    const { data } = await supabase.from('appointments').select('*, patients(*, users(name))').eq('doctor_id', dId).order('date', { ascending: false })
    setAppointments(data || [])
    setLoading(false)
  }

  const filtered = appointments.filter(a => {
    const match = a.patients?.users?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? a.status === filterStatus : true
    return match && matchStatus
  })
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const updateStatus = async (id, status) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    if (status === 'completed') {
      const { data: existing } = await supabase.from('bills').select('id').eq('appointment_id', id).single()
      if (!existing) await supabase.from('bills').insert({ appointment_id: id, amount: 150, payment_status: 'unpaid' })
    }
    toast.success('Status updated')
    fetchAppointments(doctorId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{appointments.length} total</p>
      </div>
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input-field pl-11" placeholder="Search patient..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input-field sm:w-44" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          {['pending', 'confirmed', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="glass-card overflow-hidden">
        {loading ? <LoadingSpinner /> : paginated.length === 0 ? <EmptyState title="No appointments" icon={Calendar} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>{['Patient', 'Date', 'Time', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginated.map(a => (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4 font-medium">{a.patients?.users?.name || '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{a.date}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{a.time}</td>
                    <td className="px-4 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${STATUS_COLORS[a.status]}`}>{a.status}</span></td>
                    <td className="px-4 py-4">
                      <select className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800" value={a.status} onChange={e => updateStatus(a.id, e.target.value)} disabled={a.status === 'cancelled' || a.status === 'completed'}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="p-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorAppointments
