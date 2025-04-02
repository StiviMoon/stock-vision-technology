// LoginPage.jsx
'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      
      // FastAPI usa OAuth2PasswordRequestForm que espera los datos como form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI espera 'username' aunque sea un email
      formData.append('password', password);
      
      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token, token_type } = response.data;
      
      // Guardar el token en localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('token_type', token_type);
      
      console.log('Login exitoso');
      router.push('/dashboard'); // Redirigir a la página de dashboard
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          setError(Array.isArray(err.response.data.detail) 
            ? err.response.data.detail[0].msg 
            : err.response.data.detail);
        } else {
          setError('Credenciales incorrectas');
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
            Iniciar Sesión
          </motion.h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div variants={itemVariants} className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <motion.input
                whileFocus={{ scale: 1.005 }}
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <motion.input
                whileFocus={{ scale: 1.005 }}
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              className={`w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium border border-gray-600 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </motion.button>
          </form>
          <motion.div 
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <p
              onClick={() => router.push('/register')} 
              className="text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
            >
              ¿No tienes cuenta? <span className="underline">Regístrate</span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}