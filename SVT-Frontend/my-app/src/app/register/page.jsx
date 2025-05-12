'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {authService} from '../../services/api'; // Ajusta la ruta según donde guardes el archivo

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Activar animaciones una vez que el componente se monte
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setLoading(true);
      
      // Usar el servicio de autenticación para el registro
      await authService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      
      console.log('Usuario registrado correctamente');
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
      <div 
        className={`w-full max-w-md bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700/40 transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div>
          <h2 
            className={`text-3xl font-bold text-white text-center mb-8 transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
            style={{ transitionDelay: '100ms' }}
          >
            Registrarse
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div 
              className={`relative transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ transitionDelay: '150ms' }}
            >
              <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all focus:scale-[1.005]"
              />
            </div>
            <div 
              className={`relative transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all focus:scale-[1.005]"
              />
            </div>
            <div 
              className={`relative transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ transitionDelay: '250ms' }}
            >
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full pl-10 pr-10 py-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all focus:scale-[1.005]"
              />
              <div
                className="absolute right-3 top-3.5 transition-transform duration-150 hover:scale-110 active:scale-90"
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
              </div>
            </div>
            <div 
              className={`relative transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full pl-10 pr-10 py-3 border border-gray-600 bg-gray-700/50 text-gray-200 rounded-xl focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all focus:scale-[1.005]"
              />
              <div
                className="absolute right-3 top-3.5 transition-transform duration-150 hover:scale-110 active:scale-90"
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
              </div>
            </div>
            {error && (
              <div 
                className={`flex items-center space-x-2 text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-800/30 transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-teal-800 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-medium border border-teal-700/70 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ transitionDelay: '350ms' }}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
          <div 
            className={`mt-6 text-center transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
            style={{ transitionDelay: '400ms' }}
          >
            <p
              onClick={() => router.push('/login')} 
              className="text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
            >
              ¿Ya tienes cuenta? <span className="underline">Inicia sesión</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}