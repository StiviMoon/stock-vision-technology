'use client';

import { motion } from 'framer-motion';
export default function ProductosPage() {
 
  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
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

  return (
    <div className="p-6 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Encabezado */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-white mb-2">Productos</h1>
          <p className="text-gray-400">Bienvenido al sistema de inventario SVT</p>
        </motion.div>
        </motion.div>
        
    </div>
  );
}