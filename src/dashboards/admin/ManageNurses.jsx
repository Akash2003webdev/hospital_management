import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react'
import { supabase } from '../../services/supabase'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 8

const ManageNurses = () => {
  const [nurses, setNurses] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editNurse, setEditNurse] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', department_id: '' })
  const [saving, setSaving] = useState(false)

  const fetchNurses = async () => {
    setLoading(true)
    const { data } = await supabase.from('nurses').select('*, users(name, email), departments(name)').order('created_at', { ascending: false })
    setNurses(data || [])
    setLoading(false)
  }

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('name')
    setDepartments(data || [])
  }

  useEffect(() => { fetchNurses(); fetchDepartments() }, [])

  const filtered = nurses.filter(n => n.users?.name?.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openCreate = () => { setEditNurse(null); setForm({ name: '', email: '', password: '', department_id: '' }); setModalOpen(true) }
  const openEdit = (n) => { setEditNurse(n); setForm({ name: n.users?.name || '', email: n.users?.email || '', password: '', department_id: n.department_id || '' }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || (!editNurse && !form.password)) return toast.error('Please fill required fields')
    setSaving(true)
    try {
      if (editNurse) {
        await supabase.from('users').update({ name: form.name }).eq('id', editNurse.user_id)
        await supabase.from('nurses').update({ department_id: form.department_id || null }).eq('id', editNurse.id)
        toast.success('Nurse updated')
      } else {
        const { data: sd, error: se } = await supabase.auth.signUp({ email: form.email, password: form.password })
        if (se) throw se
        await supabase.from('users').insert({ id: sd.user.id, name: form.name, email: form.email, role: 'nurse' })
        await supabase.from('nurses').insert({ user_id: sd.user.id, department_id: form.department_id || null })
        toast.success('Nurse created')
      }
      setModalOpen(false)
      fetchNurses()
    } catch (err) { toast.error(err.message || 'Error saving nurse') }
    finally { setSaving(false) }
  }

  const handleDelete = async (n) => {
    if (!window.confirm('Delete this nurse?')) return
    await supabase.from('nurses').delete().eq('id', n.id)
    toast.success('Nurse deleted')
    fetchNurses()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Nurses</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{nurses.length} total nurses</p>
        </div>
        <motion.button className="btn-primary flex items-center gap-2" onClick={openCreate} whileTap={{ scale: 0.97 }}>
          <Plus className="h-4 w-4" /> Add Nurse
        </motion.button>
      </div>
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input-field pl-11" placeholder="Search nurses..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        {loading ? <LoadingSpinner /> : paginated.length === 0 ? (
          <EmptyState title="No nurses found" icon={Users} action={<button className="btn-primary" onClick={openCreate}>Add Nurse</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Name', 'Email', 'Department', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginated.map(n => (
                  <motion.tr key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">{n.users?.name?.charAt(0) || 'N'}</div>
                        <span className="font-medium text-gray-900 dark:text-white">{n.users?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{n.users?.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{n.departments?.name || '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(n)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(n)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editNurse ? 'Edit Nurse' : 'Add Nurse'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Full Name *</label><input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          {!editNurse && <>
            <div><label className="block text-sm font-medium mb-1.5">Email *</label><input type="email" className="input-field" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1.5">Password *</label><input type="password" className="input-field" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
          </>}
          <div>
            <label className="block text-sm font-medium mb-1.5">Department</label>
            <select className="input-field" value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-outline flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <motion.button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving} whileTap={{ scale: 0.97 }}>
              {saving ? 'Saving...' : 'Save'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ManageNurses
