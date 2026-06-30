import React from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

const EmptyState = ({ title = 'No data found', description = 'There are no records to display.', icon: Icon = Inbox, action }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{description}</p>
    {action}
  </motion.div>
)

export default EmptyState
