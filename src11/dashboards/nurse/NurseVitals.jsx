import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Plus } from 'lucide-react'
import { supabase } from '../../services/supabase'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'

const NurseVitals = () => {
  const [vitals, setVitals] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ patient_id: '', blood_pressure: '', heart_rate: '', temperature: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: pats } = await supabase.from('patients').select('*, users(name)')
      setPatients(pats || [])
      // Vitals are stored as prescriptions notes with type "vitals" for simplicity
      // In production, a separate vitals table should be used
      const { data: labs } = await supabase.from('lab_reports').select('*, patients(*, users(name))').order('created_at', { ascending: false })
      setVitals(labs || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.patient_id) return toast.error('Select a patient')
    setSaving(true)
    try {
      const notesText = `BP: ${form.blood_pressure} | HR: ${form.heart_rate} bpm | Temp: ${form.temperature}°F | ${form.notes}`
      await supabase.from('lab_reports').insert({ patient_id: form.patient_id, file_url: notesText })
      toast.success('Vitals recorded')
      setModalOpen(false)
      setForm({ patient_id: '', blood_pressure: '', heart_rate: '', temperature: '', notes: '' })
      const { data } = await supabase.from('lab_reports').select('*, patients(*, users(name))').order('created_at', { ascending: false })
      setVitals(data || [])
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Vitals</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Record and track vitals</p>
        </div>
        <motion.button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)} whileTap={{ scale: 0.97 }}>
          <Plus className="h-4 w-4" /> Record Vitals
        </motion.button>
      </div>

      {loading ? <LoadingSpinner /> : vitals.length === 0 ? <EmptyState title="No vitals recorded" icon={Heart} /> : (
        <div className="space-y-4">
          {vitals.map((v, i) => (
            <motion.div key={v.id} className="glass-card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{v.patients?.users?.name}</p>
                <p className="text-xs text-gray-500">{new Date(v.created_at).toLocaleString()}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">{v.file_url}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Vitals">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Patient *</label>
            <select className="input-field" value={form.patient_id} onChange={e => setForm(p => ({ ...p, patient_id: e.target.value }))}>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.users?.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1.5">Blood Pressure</label><input className="input-field" placeholder="120/80" value={form.blood_pressure} onChange={e => setForm(p => ({ ...p, blood_pressure: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1.5">Heart Rate</label><input className="input-field" placeholder="72" value={form.heart_rate} onChange={e => setForm(p => ({ ...p, heart_rate: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1.5">Temp (°F)</label><input className="input-field" placeholder="98.6" value={form.temperature} onChange={e => setForm(p => ({ ...p, temperature: e.target.value }))} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Notes</label><textarea className="input-field h-20 resize-none" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          <div className="flex gap-3">
            <button type="button" className="btn-outline flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <motion.button type="submit" className="btn-primary flex-1" disabled={saving} whileTap={{ scale: 0.97 }}>{saving ? 'Saving...' : 'Record'}</motion.button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default NurseVitals
