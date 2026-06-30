import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { supabase } from '../../services/supabase'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editDept, setEditDept] = useState(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchDepartments = async () => {
    setLoading(true)
    const { data } = await supabase.from('departments').select('*').order('name')
    setDepartments(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchDepartments() }, [])

  const openCreate = () => { setEditDept(null); setName(''); setModalOpen(true) }
  const openEdit = (d) => { setEditDept(d); setName(d.name); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Department name is required')
    setSaving(true)
    try {
      if (editDept) {
        await supabase.from('departments').update({ name }).eq('id', editDept.id)
        toast.success('Department updated')
      } else {
        await supabase.from('departments').insert({ name })
        toast.success('Department created')
      }
      setModalOpen(false)
      fetchDepartments()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (d) => {
    if (!window.confirm('Delete this department?')) return
    const { error } = await supabase.from('departments').delete().eq('id', d.id)
    if (error) return toast.error('Cannot delete department in use')
    toast.success('Department deleted')
    fetchDepartments()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{departments.length} departments</p>
        </div>
        <motion.button className="btn-primary flex items-center gap-2" onClick={openCreate} whileTap={{ scale: 0.97 }}>
          <Plus className="h-4 w-4" /> Add Department
        </motion.button>
      </div>
      <div className="glass-card overflow-hidden">
        {loading ? <LoadingSpinner /> : departments.length === 0 ? (
          <EmptyState title="No departments" icon={Building2} action={<button className="btn-primary" onClick={openCreate}>Add Department</button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {departments.map((d, i) => (
              <motion.div key={d.id} className="glass-card p-5 hover:shadow-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.02 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(d)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editDept ? 'Edit Department' : 'Add Department'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Department Name *</label><input className="input-field" placeholder="e.g. Cardiology" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="flex gap-3">
            <button type="button" className="btn-outline flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <motion.button type="submit" className="btn-primary flex-1" disabled={saving} whileTap={{ scale: 0.97 }}>{saving ? 'Saving...' : 'Save'}</motion.button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ManageDepartments
