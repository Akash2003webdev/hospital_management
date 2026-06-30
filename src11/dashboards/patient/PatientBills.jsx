import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, DollarSign } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const PatientBills = () => {
  const { user } = useAuth()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()
      if (!patient) return setLoading(false)
      const { data: appts } = await supabase.from('appointments').select('id').eq('patient_id', patient.id)
      const apptIds = appts?.map(a => a.id) || []
      if (apptIds.length === 0) return setLoading(false)
      const { data } = await supabase.from('bills').select('*, appointments(*, doctors(*, users(name)))').in('appointment_id', apptIds).order('created_at', { ascending: false })
      setBills(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const totalPaid = bills.filter(b => b.payment_status === 'paid').reduce((s, b) => s + Number(b.amount), 0)
  const totalUnpaid = bills.filter(b => b.payment_status === 'unpaid').reduce((s, b) => s + Number(b.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Bills</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{bills.length} total bills</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Paid', value: `$${totalPaid.toFixed(2)}`, color: 'from-emerald-500 to-teal-600' },
          { label: 'Pending', value: `$${totalUnpaid.toFixed(2)}`, color: 'from-orange-500 to-amber-600' },
        ].map(c => (
          <motion.div key={c.label} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">{c.label}</p><p className="text-2xl font-bold mt-1">{c.value}</p></div>
              <div className={`w-10 h-10 bg-gradient-to-br ${c.color} rounded-xl flex items-center justify-center`}><DollarSign className="h-5 w-5 text-white" /></div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : bills.length === 0 ? <EmptyState title="No bills yet" icon={CreditCard} description="Bills are generated after completed appointments" /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>{['Doctor', 'Date', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bills.map(b => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4 font-medium">{b.appointments?.doctors?.users?.name || '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{b.appointments?.date || '—'}</td>
                    <td className="px-4 py-4 font-semibold">${Number(b.amount).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${b.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{b.payment_status}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientBills
