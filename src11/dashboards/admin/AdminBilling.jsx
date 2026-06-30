import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, DollarSign, Search } from 'lucide-react'
import { supabase } from '../../services/supabase'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

const AdminBilling = () => {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)

  const fetchBills = async () => {
    setLoading(true)
    const { data } = await supabase.from('bills').select('*, appointments(*, patients(*, users(name)), doctors(*, users(name)))').order('created_at', { ascending: false })
    setBills(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchBills() }, [])

  const filtered = bills.filter(b => {
    const patName = b.appointments?.patients?.users?.name?.toLowerCase() || ''
    const matchSearch = patName.includes(search.toLowerCase())
    const matchStatus = filterStatus ? b.payment_status === filterStatus : true
    return matchSearch && matchStatus
  })
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const totalRevenue = bills.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0)
  const pendingRevenue = bills.filter(b => b.payment_status === 'unpaid').reduce((sum, b) => sum + Number(b.amount), 0)

  const handlePaymentUpdate = async (id, status) => {
    await supabase.from('bills').update({ payment_status: status }).eq('id', id)
    toast.success('Payment status updated')
    fetchBills()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Revenue</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage patient bills and track revenue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'from-emerald-500 to-teal-600', icon: DollarSign },
          { label: 'Pending Payments', value: `$${pendingRevenue.toLocaleString()}`, color: 'from-orange-500 to-amber-600', icon: FileText },
          { label: 'Total Bills', value: bills.length, color: 'from-blue-500 to-indigo-600', icon: FileText },
        ].map(card => (
          <motion.div key={card.label} className="stat-card" whileHover={{ scale: 1.02 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input-field pl-11" placeholder="Search patient..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input-field sm:w-44" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <LoadingSpinner /> : paginated.length === 0 ? <EmptyState title="No bills found" icon={FileText} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>{['Patient', 'Doctor', 'Amount', 'Payment Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginated.map(b => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{b.appointments?.patients?.users?.name || '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{b.appointments?.doctors?.users?.name || '—'}</td>
                    <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">${Number(b.amount).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${b.payment_status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <select className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800" value={b.payment_status} onChange={e => handlePaymentUpdate(b.id, e.target.value)}>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
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

export default AdminBilling
