'use client'

import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)
  const phoneNumber = '1234567890' // Reemplazar con número real

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all hover:scale-110 group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">1</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-80"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500 p-2 rounded-full">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Soporte SIEME</div>
                <div className="text-xs text-slate-500">Típicamente responde en minutos</div>
              </div>
            </div>
            <p className="text-slate-600 mb-4 text-sm">
              ¿Tienes alguna pregunta? Nuestro equipo está listo para ayudarte.
            </p>
            <a
              href={`https://wa.me/${phoneNumber}?text=Hola, me interesa conocer más sobre SIEME`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 rounded-xl font-semibold transition-colors"
            >
              Iniciar Chat
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
