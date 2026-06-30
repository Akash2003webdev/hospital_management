import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '916380234830' // Change this to your number (country code + number, no + or spaces)
const WHATSAPP_MESSAGE = 'Hello! I would like to know more about MediCare HMS services.'

const WhatsAppButton = () => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const handleClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Tooltip bubble */}
      <AnimatePresence>
        {showTooltip && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 px-4 py-3 max-w-[220px]"
          >
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setDismissed(true) }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
              <X className="h-3 w-3 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Avatar + message */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow">
                <span className="text-white text-xs font-bold">MC</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">MediCare Support</p>
                <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Online
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              👋 Hi there! Need help? Chat with us on WhatsApp!
            </p>

            {/* Tail */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-800 border-r border-b border-slate-100 dark:border-slate-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer focus:outline-none"
        style={{
          background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
          boxShadow: '0 8px 32px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.15)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 1 }}
        aria-label="Chat on WhatsApp"
      >
        {/* Ping ring */}
        <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20" />

        {/* WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-7 h-7 fill-white"
        >
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.492.68 4.824 1.865 6.82L2 30l7.38-1.836A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Zm0 25.5a11.44 11.44 0 0 1-5.82-1.588l-.418-.248-4.38 1.09 1.116-4.27-.272-.44A11.455 11.455 0 0 1 4.5 16C4.5 9.596 9.596 4.5 16 4.5S27.5 9.596 27.5 16 22.404 27.5 16 27.5Zm6.29-8.556c-.344-.172-2.036-1.004-2.352-1.118-.316-.115-.547-.172-.777.172-.23.344-.893 1.118-1.094 1.348-.2.23-.402.258-.746.086-.344-.172-1.452-.535-2.766-1.707-1.022-.912-1.712-2.038-1.912-2.382-.2-.344-.022-.53.15-.702.155-.155.344-.402.516-.603.172-.2.23-.344.344-.573.115-.23.058-.43-.028-.603-.086-.172-.777-1.873-1.065-2.565-.28-.673-.565-.582-.777-.593l-.662-.011c-.23 0-.603.086-.918.43-.316.344-1.207 1.18-1.207 2.876s1.236 3.337 1.407 3.566c.172.23 2.432 3.713 5.892 5.207.824.356 1.467.568 1.969.727.827.263 1.58.226 2.174.137.663-.1 2.036-.831 2.323-1.635.287-.803.287-1.492.2-1.635-.086-.143-.316-.23-.66-.402Z" />
        </svg>
      </motion.button>
    </div>
  )
}

export default WhatsAppButton
