'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div 
        className={`w-full max-w-md p-8 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/40 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="space-y-6">
          <h1 
            className={`text-4xl font-bold text-white mb-2 transform transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{ transitionDelay: '200ms' }}
          >
            Bienvenido a SVT
          </h1>
          <p 
            className={`text-gray-400 mb-8 transform transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{ transitionDelay: '350ms' }}
          >
            Únete a nuestra plataforma y comienza a mejorar tu sistema de inventarios.
          </p>
          <div className="flex flex-col space-y-4">
            <button 
              className={`cursor-pointer group relative bg-gray-700 text-white py-3 px-4 rounded-xl font-medium border border-gray-600 overflow-hidden transition-all duration-300 ease-out transform hover:shadow-lg hover:shadow-gray-500/20 hover:border-gray-500 active:translate-y-1 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              onClick={() => router.push('/login')}
              style={{ transitionDelay: '500ms' }}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                Iniciar Sesión
              </span>
              <span className="absolute inset-0 bg-gray-600 transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></span>
              <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">→</span>
            </button>
            <button 
              className={`cursor-pointer group relative bg-teal-800 text-white py-3 px-4 rounded-xl font-medium border border-teal-700/70 overflow-hidden transition-all duration-300 ease-out transform hover:shadow-lg hover:shadow-teal-500/20 hover:border-teal-600 active:translate-y-1 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              onClick={() => router.push('/register')}
              style={{ transitionDelay: '650ms' }}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                Registrarse
              </span>
              <span className="absolute inset-0 bg-teal-700 transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></span>
              <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}