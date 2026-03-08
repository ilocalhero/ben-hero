import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, Compass } from 'lucide-react'
import { NeonText } from '../components/ui'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Compass
          size={64}
          className="text-neon-purple mx-auto mb-4"
          style={{ filter: 'drop-shadow(0 0 16px #b24bff)' }}
        />
        <NeonText as="h1" color="purple" className="text-6xl font-black mb-2">
          404
        </NeonText>
        <p className="text-white font-bold text-xl mb-1">Página no encontrada</p>
        <p className="text-[#8b8fb0] text-sm max-w-xs mx-auto">
          Esta ruta no existe en el mapa. ¡Vuelve a territorio conocido!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: '#00d4ff22',
            border: '1px solid #00d4ff44',
            color: '#00d4ff',
            boxShadow: '0 0 12px #00d4ff22',
          }}
        >
          <Home size={16} />
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  )
}
