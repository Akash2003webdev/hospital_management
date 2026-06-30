import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, X } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

const PatientAppointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [patientId, setPatientId] = useState(null)
  const [form, setForm] = useState({ doctor_id: '', date: '', time: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()
      if (!patient) return setLoading(false)
      setPatientId(patient.id)

      const [{ data: appts }, { data: docs }] = await Promise.all([
        supabase.from('appointments').select('*, doctors(*, users(name))').eq('patient_id', patient.id).order('date', { ascending: false }),
        supabase.from('doctors').select('*, users(name)').eq('status', 'active'),
      ])
      setAppointments(appts || [])
      setDoctors(docs || [])
      setLoading(false)
    }
    load()
  }, [user])

  const fetchAppointments = async () => {
    const { data } = await supabase.from('appointments').select('*, doctors(*, users(name))').eq('patient_id', patientId).order('date', { ascending: false })
    setAppointments(data || [])
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!form.doctor_id || !form.date || !form.time) return toast.error('Fill all fields')
    setSaving(true)
    try {
      const { data: doctorData } = await supabase.from('doctors').select('status').eq('id', form.doctor_id).single()
      if (doctorData?.status !== 'active') return toast.error('Selected doctor is not active')
      const { count } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', form.doctor_id).eq('date', form.date).eq('time', form.time).neq('status', 'cancelled')
      if (count > 0) return toast.error('This time slot is already booked')
      await supabase.from('appointments').insert({ patient_id: patientId, doctor_id: form.doctor_id, date: form.date, time: form.time, status: 'pending' })
      toast.success('Appointment booked successfully!')
      setModalOpen(false)
      fetchAppointments()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleCancel = async (id, status) => {
    if (status !== 'pending') return toast.error('Only pending appointments can be cancelled')
    if (!window.confirm('Cancel this appointment?')) return
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    toast.success('Appointment cancelled')
    fetchAppointments()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{appointments.length} total</p>
        </div>
        <motion.button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)} whileTap={{ scale: 0.97 }}>
          <Plus className="h-4 w-4" /> Book Appointment
        </motion.button>
      </div>

      {loading ? <LoadingSpinner /> : appointments.length === 0 ? (
        <EmptyState title="No appointments" description="Book your first appointment with a doctor" icon={Calendar} action={<button className="btn-primary" onClick={() => setModalOpen(true)}>Book Appointment</button>} />
      ) : (
        <div className="space-y-4">
          {appointments.map((a, i) => (
            <motion.div key={a.id} className="glass-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {a.doctors?.users?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{a.doctors?.users?.name}</p>
                    <p className="text-sm text-gray-500">{a.doctors?.specialization}</p>
                    <p className="text-xs text-gray-400">{a.date} at {a.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  {a.status === 'pending' && (
                    <button onClick={() => handleCancel(a.id, a.status)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Book Appointment">
        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Select Doctor *</label>
            <select className="input-field" value={form.doctor_id} onChange={e => setForm(p => ({ ...p, doctor_id: e.target.value }))}>
              <option value="">Choose a doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.users?.name} — {d.specialization}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Date *</label><input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} /></div>
            <div><label className="block text-sm font-medium mb-1.5">Time *</label><input type="time" className="input-field" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-outline flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <motion.button type="submit" className="btn-primary flex-1" disabled={saving} whileTap={{ scale: 0.97 }}>{saving ? 'Booking...' : 'Book Appointment'}</motion.button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PatientAppointments
