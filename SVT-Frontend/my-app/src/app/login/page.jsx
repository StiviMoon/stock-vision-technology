'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {authService} from '../../services/api'; // Ajusta la ruta según donde guardes el archivo

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Activar animaciones una vez que el componente se monte
    setIsVisible(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      
      // Usar el servicio de autenticación para el login
      await authService.login(email, password);
      
      console.log('Login exitoso');
      router.push('/dashboard'); // Redirigir a la página de dashboard
    } catch (err) {
      console.error('Error durante el login:', err);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        if (err.response.status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (err.response.data && err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.request) {
        // La solicitud se realizó pero no se recibió respuesta
        errorMessage = 'No se pudo conectar con el servidor';
      }
      
      setError(errorMessage);
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
            style={{ transitionDelay: '150ms' }}
          >
            Iniciar Sesión
          </h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div 
              className={`relative transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              className={`w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium border border-gray-600 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ transitionDelay: '300ms' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
          <div 
            className={`mt-6 text-center transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
            style={{ transitionDelay: '350ms' }}
          >
            <p
              onClick={() => router.push('/register')} 
              className="text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
            >
              ¿No tienes cuenta? <span className="underline">Regístrate</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}