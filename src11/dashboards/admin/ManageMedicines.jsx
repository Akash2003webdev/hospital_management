import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Pill } from 'lucide-react'
import { supabase } from '../../services/supabase'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

const ManageMedicines = () => {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMed, setEditMed] = useState(null)
  const [form, setForm] = useState({ name: '', stock: '', price: '' })
  const [saving, setSaving] = useState(false)

  const fetchMedicines = async () => {
    setLoading(true)
    const { data } = await supabase.from('medicines').select('*').order('name')
    setMedicines(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchMedicines() }, [])

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const openCreate = () => { setEditMed(null); setForm({ name: '', stock: '', price: '' }); setModalOpen(true) }
  const openEdit = (m) => { setEditMed(m); setForm({ name: m.name, stock: m.stock, price: m.price }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || form.stock === '' || form.price === '') return toast.error('Fill all fields')
    setSaving(true)
    try {
      const payload = { name: form.name, stock: parseInt(form.stock), price: parseFloat(form.price) }
      if (editMed) {
        await supabase.from('medicines').update(payload).eq('id', editMed.id)
        toast.success('Medicine updated')
      } else {
        await supabase.from('medicines').insert(payload)
        toast.success('Medicine added')
      }
      setModalOpen(false)
      fetchMedicines()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (m) => {
    if (!window.confirm('Delete this medicine?')) return
    await supabase.from('medicines').delete().eq('id', m.id)
    toast.success('Medicine deleted')
    fetchMedicines()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Medicine Inventory</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{medicines.length} medicines</p>
        </div>
        <motion.button className="btn-primary flex items-center gap-2" onClick={openCreate} whileTap={{ scale: 0.97 }}>
          <Plus className="h-4 w-4" /> Add Medicine
        </motion.button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input-field pl-11" placeholder="Search medicines..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <LoadingSpinner /> : paginated.length === 0 ? (
          <EmptyState title="No medicines found" icon={Pill} action={<button className="btn-primary" onClick={openCreate}>Add Medicine</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>{['Name', 'Stock', 'Price', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginated.map(m => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Pill className="h-4 w-4 text-white" /></div>
                        <span className="font-medium text-gray-900 dark:text-white">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{m.stock} units</td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">${Number(m.price).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${m.stock === 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : m.stock < 10 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                        {m.stock === 0 ? 'Out of Stock' : m.stock < 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(m)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"><Trash2 className="h-4 w-4" /></button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMed ? 'Edit Medicine' : 'Add Medicine'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Medicine Name *</label><input className="input-field" placeholder="Aspirin" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Stock (units) *</label><input type="number" min="0" className="input-field" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1.5">Price ($) *</label><input type="number" min="0" step="0.01" className="input-field" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-outline flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
            <motion.button type="submit" className="btn-primary flex-1" disabled={saving} whileTap={{ scale: 0.97 }}>{saving ? 'Saving...' : 'Save'}</motion.button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ManageMedicines
