import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Calendar, Plus } from 'lucide-react'
import { supabase } from '../../services/supabase'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10
const STATUS_COLORS = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', date: '', time: '', status: 'pending' })
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: appts }, { data: docs }, { data: pats }] = await Promise.all([
      supabase.from('appointments').select('*, patients(*, users(name)), doctors(*, users(name))').order('date', { ascending: false }),
      supabase.from('doctors').select('*, users(name)').eq('status', 'active'),
      supabase.from('patients').select('*, users(name)'),
    ])
    setAppointments(appts || [])
    setDoctors(docs || [])
    setPatients(pats || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = appointments.filter(a => {
    const matchSearch = a.patients?.users?.name?.toLowerCase().includes(search.toLowerCase()) || a.doctors?.users?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? a.status === filterStatus : true
    return matchSearch && matchStatus
  })
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleStatusChange = async (id, status) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    if (status === 'completed') {
      const appt = appointments.find(a => a.id === id)
      if (appt) {
        const { data: existing } = await supabase.from('bills').select('id').eq('appointment_id', id).single()
        if (!existing) {
          await supabase.from('bills').insert({ appointment_id: id, amount: 150, payment_status: 'unpaid' })
        }
      }
    }
    toast.success('Status updated')
    fetchAll()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.patient_id || !form.doctor_id || !form.date || !form.time) return toast.error('Fill all fields')
    setSaving(true)
    try {
      const { data: doctorData } = await supabase.from('doctors').select('status').eq('id', form.doctor_id).single()
      if (doctorData?.status !== 'active') return toast.error('Doctor is not active')
      const { count } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', form.doctor_id).eq('date', form.date).eq('time', form.time).neq('status', 'cancelled')
      if (count > 0) return toast.error('Time slot already booked for this doctor')
      const { error } = await supabase.from('appointments').insert({ ...form })
      if (error) throw error
      toast.success('Appointment created')
      setModalOpen(false)
      fetchAll()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{appointments.length} total</p>
        </div>
        <motion.button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)} whileTap={{ scale: 0.97 }}>
          <Plus className="h-4 w-4" /> New Appointment
        </motion.button>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input-field pl-11" placeholder="Search patient or doctor..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input-field sm:w-44" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          {['pending', 'confirmed', 'completed', 'cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <LoadingSpinner /> : paginated.length === 0 ? (
          <EmptyState title="No appointments" icon={Calendar} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>{['Patient', 'Doctor', 'Date', 'Time', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginated.map(a => (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{a.patients?.users?.name || '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{a.doctors?.users?.name || '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{a.date}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{a.time}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${STATUS_COLORS[a.status] || ''}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <select className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800" value={a.status} onChange={e => handleStatusChange(a.id, e.target.value)}>
                        {['pending', 'confirmed', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Appointment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Patient *</label>
            <select className="input-field" value={form.patient_id} onChange={e => setForm(p => ({ ...p, patient_id: e.target.value }))}>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.users?.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Doctor *</label>
            <select className="input-field" value={form.doctor_id} onChange={e => setForm(p => ({ ...p, doctor_id: e.target.value }))}>
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.users?.name} - {d.specialization}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Date *</label><input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} /></div>
            <div><label className="block text-sm font-medium mb-1.5">Time *</label><input type="time" className="input-field" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-outline flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <motion.button type="submit" className="btn-primary flex-1" disabled={saving} whileTap={{ scale: 0.97 }}>{saving ? 'Saving...' : 'Create'}</motion.button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ManageAppointments
