import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, UserCog } from 'lucide-react'
import { supabase } from '../../services/supabase'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 8

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editDoctor, setEditDoctor] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '', status: 'active', department_id: '' })
  const [saving, setSaving] = useState(false)

  const fetchDoctors = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('doctors')
      .select('*, users(name, email), departments(name)')
      .order('created_at', { ascending: false })
    if (!error) setDoctors(data || [])
    setLoading(false)
  }

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('name')
    setDepartments(data || [])
  }

  useEffect(() => { fetchDoctors(); fetchDepartments() }, [])

  const filtered = doctors.filter(d =>
    d.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openCreate = () => {
    setEditDoctor(null)
    setForm({ name: '', email: '', password: '', specialization: '', status: 'active', department_id: '' })
    setModalOpen(true)
  }

  const openEdit = (doc) => {
    setEditDoctor(doc)
    setForm({ name: doc.users?.name || '', email: doc.users?.email || '', password: '', specialization: doc.specialization || '', status: doc.status || 'active', department_id: doc.department_id || '' })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || (!editDoctor && !form.password) || !form.specialization) return toast.error('Please fill required fields')
    setSaving(true)
    try {
      if (editDoctor) {
        // Update doctor record
        await supabase.from('users').update({ name: form.name }).eq('id', editDoctor.user_id)
        const { error } = await supabase.from('doctors').update({
          specialization: form.specialization,
          status: form.status,
          department_id: form.department_id || null,
        }).eq('id', editDoctor.id)
        if (error) throw error
        toast.success('Doctor updated')
      } else {
        // Create new auth user + profile
        const { data: authData, error: authErr } = await supabase.auth.admin ? 
          { data: null, error: { message: 'Admin API not available. Use Supabase Dashboard to create users.' } } :
          { data: null, error: { message: 'Please use Supabase Dashboard to create doctor accounts, or enable Admin API.' } }
        
        // Fallback: create via signUp (no admin API in client)
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email: form.email, password: form.password })
        if (signUpErr) throw signUpErr
        
        await supabase.from('users').insert({ id: signUpData.user.id, name: form.name, email: form.email, role: 'doctor' })
        const { error } = await supabase.from('doctors').insert({
          user_id: signUpData.user.id,
          specialization: form.specialization,
          status: form.status,
          department_id: form.department_id || null,
        })
        if (error) throw error
        toast.success('Doctor created')
      }
      setModalOpen(false)
      fetchDoctors()
    } catch (err) {
      toast.error(err.message || 'Error saving doctor')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (doc) => {
    // Check for active appointments
    const { count } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', doc.id).neq('status', 'cancelled')
    if (count > 0) return toast.error('Cannot delete doctor with active appointments')
    if (!window.confirm('Delete this doctor?')) return
    await supabase.from('doctors').delete().eq('id', doc.id)
    toast.success('Doctor deleted')
    fetchDoctors()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Doctors</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{doctors.length} total doctors</p>
        </div>
        <motion.button className="btn-primary flex items-center gap-2" onClick={openCreate} whileTap={{ scale: 0.97 }}>
          <Plus className="h-4 w-4" /> Add Doctor
        </motion.button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input-field pl-11" placeholder="Search doctors..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <LoadingSpinner /> : paginated.length === 0 ? (
          <EmptyState title="No doctors found" description="Add your first doctor to get started." icon={UserCog} action={<button className="btn-primary" onClick={openCreate}>Add Doctor</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Name', 'Email', 'Specialization', 'Department', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginated.map(doc => (
                  <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                          {doc.users?.name?.charAt(0) || 'D'}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{doc.users?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{doc.users?.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{doc.specialization}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{doc.departments?.name || '—'}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${doc.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(doc)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editDoctor ? 'Edit Doctor' : 'Add New Doctor'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name *</label>
            <input className="input-field" placeholder="Dr. John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          {!editDoctor && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <input type="email" className="input-field" placeholder="doctor@hospital.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Password *</label>
                <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">Specialization *</label>
            <input className="input-field" placeholder="Cardiology" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Department</label>
            <select className="input-field" value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select className="input-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-outline flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <motion.button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving} whileTap={{ scale: 0.97 }}>
              {saving ? <><motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />Saving...</> : 'Save Doctor'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ManageDoctors
