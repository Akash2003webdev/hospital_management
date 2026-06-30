import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, FileText } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const DoctorPrescriptions = () => {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ appointment_id: '', notes: '', medicine_id: '', quantity: 1 })
  const [saving, setSaving] = useState(false)
  const [doctorId, setDoctorId] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).single()
      if (!doc) return setLoading(false)
      setDoctorId(doc.id)

      const [{ data: prescs }, { data: appts }, { data: meds }] = await Promise.all([
        supabase.from('prescriptions').select('*, appointments(*, patients(*, users(name)))').eq('doctor_id', doc.id).order('created_at', { ascending: false }),
        supabase.from('appointments').select('*, patients(*, users(name))').eq('doctor_id', doc.id).eq('status', 'confirmed'),
        supabase.from('medicines').select('*').gt('stock', 0),
      ])
      setPrescriptions(prescs || [])
      setAppointments(appts || [])
      setMedicines(meds || [])
      setLoading(false)
    }
    load()
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.appointment_id || !form.notes) return toast.error('Fill required fields')
    setSaving(true)
    try {
      const { error } = await supabase.from('prescriptions').insert({ appointment_id: form.appointment_id, doctor_id: doctorId, notes: form.notes })
      if (error) throw error

      if (form.medicine_id) {
        const med = medicines.find(m => m.id === form.medicine_id)
        if (!med || med.stock < form.quantity) return toast.error('Insufficient medicine stock')
        await supabase.from('medicines').update({ stock: med.stock - form.quantity }).eq('id', form.medicine_id)
      }

      toast.success('Prescription created')
      setModalOpen(false)
      // Refresh
      const { data: prescs } = await supabase.from('prescriptions').select('*, appointments(*, patients(*, users(name)))').eq('doctor_id', doctorId).order('created_at', { ascending: false })
      setPrescriptions(prescs || [])
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{prescriptions.length} total</p>
        </div>
        <motion.button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)} whileTap={{ scale: 0.97 }}>
          <Plus className="h-4 w-4" /> New Prescription
        </motion.button>
      </div>

      {loading ? <LoadingSpinner /> : prescriptions.length === 0 ? <EmptyState title="No prescriptions" icon={FileText} /> : (
        <div className="space-y-4">
          {prescriptions.map(p => (
            <motion.div key={p.id} className="glass-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{p.appointments?.patients?.users?.name || 'Unknown Patient'}</p>
                  <p className="text-xs text-gray-500">{p.appointments?.date} at {p.appointments?.time}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">{p.notes}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Prescription">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Appointment *</label>
            <select className="input-field" value={form.appointment_id} onChange={e => setForm(p => ({ ...p, appointment_id: e.target.value }))}>
              <option value="">Select Appointment</option>
              {appointments.map(a => <option key={a.id} value={a.id}>{a.patients?.users?.name} — {a.date} {a.time}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Prescription Notes *</label>
            <textarea className="input-field h-24 resize-none" placeholder="Enter medication instructions, dosage, etc." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Medicine (optional)</label>
            <select className="input-field" value={form.medicine_id} onChange={e => setForm(p => ({ ...p, medicine_id: e.target.value }))}>
              <option value="">Select Medicine</option>
              {medicines.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.stock})</option>)}
            </select>
          </div>
          {form.medicine_id && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Quantity</label>
              <input type="number" min="1" className="input-field" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) }))} />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-outline flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <motion.button type="submit" className="btn-primary flex-1" disabled={saving} whileTap={{ scale: 0.97 }}>{saving ? 'Saving...' : 'Create Prescription'}</motion.button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DoctorPrescriptions
