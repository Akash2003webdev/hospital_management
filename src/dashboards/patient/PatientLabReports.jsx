import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Upload, Download } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const PatientLabReports = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [patientId, setPatientId] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()
      if (!patient) return setLoading(false)
      setPatientId(patient.id)
      const { data } = await supabase.from('lab_reports').select('*').eq('patient_id', patient.id).order('created_at', { ascending: false })
      setReports(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!patientId) return toast.error('Patient profile not found')
    setUploading(true)
    try {
      const filePath = `${patientId}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from('lab-reports').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('lab-reports').getPublicUrl(filePath)
      await supabase.from('lab_reports').insert({ patient_id: patientId, file_url: publicUrl })
      toast.success('Lab report uploaded')
      const { data } = await supabase.from('lab_reports').select('*').eq('patient_id', patientId).order('created_at', { ascending: false })
      setReports(data || [])
    } catch (err) { toast.error('Upload failed: ' + err.message) }
    finally { setUploading(false); e.target.value = '' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lab Reports</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{reports.length} reports</p>
        </div>
        {/* <label className="btn-primary flex items-center gap-2 cursor-pointer">
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Report'}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label> */}
      </div>

      {loading ? <LoadingSpinner /> : reports.length === 0 ? <EmptyState title="No lab reports" icon={FlaskConical} description="Upload your lab reports to keep them organized" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r, i) => (
            <motion.div key={r.id} className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FlaskConical className="h-5 w-5 text-white" />
                </div>
                {/* <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600">
                  <Download className="h-4 w-4" />
                </a> */}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.file_url.split('/').pop() || 'Lab Report'}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PatientLabReports
