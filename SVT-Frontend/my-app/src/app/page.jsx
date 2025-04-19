// HomePage.jsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring', 
        stiffness: 260, 
        damping: 20 
      } 
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.97 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md p-8 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/40"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h1 variants={itemVariants} className="text-4xl font-bold text-white mb-2">
            Bienvenido a SVT
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-400 mb-8">
            Únete a nuestra plataforma y comienza a mejorar tu sistema de inventarios.
          </motion.p>
          <div className="flex flex-col space-y-4">
            <motion.button 
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium border border-gray-600 transition-all duration-200"
              onClick={() => router.push('/login')}
            >
              Iniciar Sesión
            </motion.button>
            <motion.button 
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-medium border border-teal-700/70 transition-all duration-200"
              onClick={() => router.push('/register')}
            >
              Registrarse
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}