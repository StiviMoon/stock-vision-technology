
// RegisterPage.jsx
'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: formData.email,
        password: formData.password
      });
      
      console.log('Usuario registrado:', response.data);
      router.push('/login');
    } catch (err) {
      console.error('Error al registrar:', err);
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          setError(Array.isArray(err.response.data.detail) 
            ? err.response.data.detail[0].msg
            : err.response.data.detail);
        } else {
          setError('Error al registrar usuario');
        }
      } else {
        setError('Error de conexión al servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700/40"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-white text-center mb-8">
            Registrarse
          </motion.h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <motion.div variants={itemVariants} className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <motion.input
                whileFocus={{ scale: 1.005 }}
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <motion.input
                whileFocus={{ scale: 1.005 }}
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <motion.input
                whileFocus={{ scale: 1.005 }}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full pl-10 pr-10 py-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all"
              />
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3 top-3.5"
              >
                {showPassword ? (
                  <EyeOff 
                    onClick={() => setShowPassword(false)}
                    className="text-gray-400 cursor-pointer" 
                    size={20} 
                  />
                ) : (
                  <Eye 
                    onClick={() => setShowPassword(true)}
                    className="text-gray-400 cursor-pointer" 
                    size={20} 
                  />
                )}
              </motion.div>
            </motion.div>
            <motion.div variants={itemVariants} className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <motion.input
                whileFocus={{ scale: 1.005 }}
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full pl-10 pr-10 py-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all"
              />
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3 top-3.5"
              >
                {showConfirmPassword ? (
                  <EyeOff 
                    onClick={() => setShowConfirmPassword(false)}
                    className="text-gray-400 cursor-pointer" 
                    size={20} 
                  />
                ) : (
                  <Eye 
                    onClick={() => setShowConfirmPassword(true)}
                    className="text-gray-400 cursor-pointer" 
                    size={20} 
                  />
                )}
              </motion.div>
            </motion.div>
            {error && (
              <motion.div 
                variants={itemVariants}
                className="flex items-center space-x-2 text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-800/30"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
            
            <motion.button 
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              type="submit" 
              disabled={loading}
              className={`w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-medium border border-teal-700/70 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </motion.button>
          </form>
          <motion.div 
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <p
              onClick={() => router.push('/login')} 
              className="text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
            >
              ¿Ya tienes cuenta? <span className="underline">Inicia sesión</span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}