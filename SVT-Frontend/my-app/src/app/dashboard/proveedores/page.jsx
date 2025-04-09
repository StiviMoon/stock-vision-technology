'use client';


import { motion } from 'framer-motion';
export default function ProveedoresdPage() {
 
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
          <h1 className="text-3xl font-bold text-white mb-2">Proveedores</h1>
          <p className="text-gray-400">Bienvenido al sistema de inventario SVT</p>

        </motion.div>
        {/* Formulario de registro */}
        <motion.div variants={itemVariants} className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700/40">
          <h2 className="text-2xl font-bold text-white mb-4">Registrar Proveedor</h2>
          {/* Aquí puedes agregar el formulario de registro de proveedores */}
          <form className="space-y-4">
            <input type="text" placeholder="Nombre del Proveedor" className="w-full p-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all" />
            <input type="email" placeholder="Correo Electrónico" className="w-full p-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all" />
            <input type="tel" placeholder="Teléfono" className="w-full p-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all" />
            <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-all">
              Registrar
            </button>
          </form>
          
        </motion.div>
        </motion.div>
        
    </div>
  );
}