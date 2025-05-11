import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const authService = {
  /**
   * Realiza el inicio de sesión del usuario
   * @param {string} email - El correo electrónico del usuario
   * @param {string} password - La contraseña del usuario
   * @returns {Promise} Promesa con los datos de autenticación
   */
  login: async (email, password) => {
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
    
    // Guardar en cookie para que esté disponible en todo el sitio
    document.cookie = `token=${access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
    
    // También en localStorage para uso en el cliente si es necesario
    localStorage.setItem('token', access_token);
    localStorage.setItem('token_type', token_type);
    
    return response.data;
  }
};

export default authService;