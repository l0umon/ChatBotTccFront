import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, Eye, EyeOff } from 'lucide-react';
import Api from './Api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await Api.post('/auth/login', { email, password });
      
      // Guardar token
      localStorage.setItem('token', response.data.token);
      
      // Guardar datos del usuario
      if (response.data.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        console.log('Datos de usuario guardados:', response.data.user);
      } else {
        console.log('No se recibieron datos de usuario del servidor');
        // Guardar datos mínimos por defecto
        localStorage.setItem('currentUser', JSON.stringify({
          nombre: 'Usuario',
          apellido: '',
          rol: 'alumno'
        }));
      }
      
      navigate('/chat');
    } catch (err: any) {
      console.error('Error en login:', err);
      
      // Manejo específico de errores
      if (err.response?.status === 429) {
        setError(err.response?.data || 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.');
      } else if (err.response?.status === 401) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else if (err.response?.status === 403) {
        setError('Acceso restringido. El sistema está temporalmente restringido o tu cuenta no tiene permisos para acceder en este momento.');
      } else if (err.response?.status === 404) {
        setError('Usuario no encontrado. Verifica tu email.');
      } else if (err.response?.status >= 500) {
        setError('Error del servidor. Intenta nuevamente más tarde.');
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError('Error de conexión. Verifica tu conexión a internet.');
      } else {
        setError(err.response?.data?.message || 'Error al iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  // Estilos inline para evitar conflictos con CSS global
  const containerStyle = {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #16a085 0%, #2c8d6f 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    margin: '0',
    boxSizing: 'border-box' as const,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'fixed' as const,
    top: '0',
    left: '0',
    overflow: 'auto'
  };

  const cardStyle = {
    width: '340px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    backgroundColor: '#fff'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
    padding: '40px 30px',
    textAlign: 'center' as const,
    color: 'white'
  };

  const formContainerStyle = {
    backgroundColor: '#2c3e50',
    padding: '30px',
    color: 'white'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    margin: '8px 0 0 0',
    backgroundColor: '#34495e',
    border: '2px solid #4a5a6b',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#bdc3c7',
    fontSize: '14px',
    fontWeight: '500'
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#16a085',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    margin: '20px 0 0 0'
  };

  const errorStyle = {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    border: '1px solid #e74c3c',
    color: '#e74c3c',
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '14px',
    margin: '15px 0'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ marginBottom: '20px' }}>
            <GraduationCap size={48} color="white" />
          </div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            color: 'white'
          }}>
            ChatBot Universitario
          </h1>
          <p style={{ 
            fontSize: '14px', 
            margin: '0',
            opacity: 0.9,
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Sistema de Asistencia Virtual con IA
          </p>
        </div>

        {/* Form */}
        <div style={formContainerStyle}>
          <form onSubmit={handleLogin}>
            
            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingRight: '45px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#16a085'}
                  onBlur={(e) => e.target.style.borderColor = '#4a5a6b'}
                  required
                />
                <Mail 
                  size={20} 
                  color="#95a5a6" 
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingRight: '80px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#16a085'}
                  onBlur={(e) => e.target.style.borderColor = '#4a5a6b'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? 
                    <EyeOff size={20} color="#95a5a6" /> : 
                    <Eye size={20} color="#95a5a6" />
                  }
                </button>
                <Lock 
                  size={18} 
                  color="#95a5a6" 
                  style={{
                    position: 'absolute',
                    right: '45px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={errorStyle}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...buttonStyle,
                backgroundColor: isLoading ? '#7f8c8d' : '#16a085',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#138d75';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#16a085';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span>Iniciando...</span>
                </>
              ) : (
                <>
                  <Lock size={20} />
                  <span>INICIAR SESIÓN</span>
                </>
              )}
            </button>

            {/* Register Link */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '25px',
              paddingTop: '20px',
              borderTop: '1px solid #4a5a6b'
            }}>
              <p style={{ 
                margin: '0',
                fontSize: '14px',
                color: '#95a5a6'
              }}>
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#16a085',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1abc9c'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#16a085'}
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* CSS Animation for loading spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Login;