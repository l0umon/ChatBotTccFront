import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  AlertCircle,
  GraduationCap,
  UserPlus
} from 'lucide-react';
import Api from './Api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Professional input styles
  const inputStyle = {
    width: '100%',
    padding: '1rem 1rem 1rem 3rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '400',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#1f2937',
    backdropFilter: 'blur(10px)',
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    fontFamily: 'inherit'
  };

  const iconStyle = {
    position: 'absolute' as const,
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    transition: 'color 0.2s'
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await Api.post('/auth/login', { email, password });
      
      // Guardar token
      localStorage.setItem('authToken', response.data.token);
      
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
    } catch (err: unknown) {
      console.error('Error en login:', err);
      
      // Manejo específico de errores
      const error = err as { 
        response?: { 
          status?: number; 
          data?: string | { message?: string } 
        };
        code?: string;
      };
      
      if (error.response?.status === 429) {
        const data = error.response.data;
        const message = typeof data === 'string' ? data : 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.';
        setError(message);
      } else if (error.response?.status === 401) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else if (error.response?.status === 403) {
        setError('Acceso restringido. El sistema está temporalmente restringido o tu cuenta no tiene permisos para acceder en este momento.');
      } else if (error.response?.status === 404) {
        setError('Usuario no encontrado. Verifica tu email.');
      } else if (error.response?.status && error.response.status >= 500) {
        setError('Error del servidor. Intenta nuevamente más tarde.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Error de conexión. Verifica tu conexión a internet.');
      } else {
        const data = error.response?.data;
        const message = typeof data === 'object' && data?.message ? data.message : 'Error al iniciar sesión. Intenta nuevamente.';
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <>
      <style>{`
        /* Login component styles - Professional UI/UX Design */
        .login-container {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: linear-gradient(135deg, #047857 0%, #065f46 25%, #064e3b 50%, #0f172a 100%) !important;
          color: #1f2937 !important;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          z-index: 1000 !important;
          color-scheme: light !important;
        }

        .login-container * {
          color-scheme: light !important;
          box-sizing: border-box !important;
        }

        .login-form-card {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1) !important;
          max-width: 450px !important;
        }

        .login-input {
          background: rgba(255, 255, 255, 0.9) !important;
          color: #1f2937 !important;
          border: 2px solid #e5e7eb !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }

        .login-input:focus {
          background: white !important;
          color: #1f2937 !important;
          border-color: #10b981 !important;
          box-shadow: 
            0 0 0 3px rgba(16, 185, 129, 0.1),
            0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
          outline: none !important;
        }

        .login-input:hover {
          border-color: #10b981 !important;
        }

        .login-input::placeholder {
          color: #9ca3af !important;
        }

        .login-input::-webkit-input-placeholder {
          color: #9ca3af !important;
        }

        .login-input::-moz-placeholder {
          color: #9ca3af !important;
        }

        .login-button {
          background: linear-gradient(135deg, #10b981 0%, #047857 100%) !important;
          color: white !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.2) !important;
        }

        .login-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #065f46 100%) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.3) !important;
        }

        .login-button:disabled {
          background: #9ca3af !important;
          transform: none !important;
          box-shadow: none !important;
        }

        .login-floating-elements::before,
        .login-floating-elements::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 6s ease-in-out infinite;
        }

        .login-floating-elements::before {
          width: 200px;
          height: 200px;
          top: 10%;
          left: -10%;
          animation-delay: 0s;
        }

        .login-floating-elements::after {
          width: 150px;
          height: 150px;
          bottom: 20%;
          right: -5%;
          animation-delay: 3s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .login-glass-effect {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .login-container {
            padding: 0.5rem !important;
          }
          
          .login-form-card {
            padding: 2rem 1.5rem !important;
            margin: 0.5rem !important;
            max-width: calc(100vw - 1rem) !important;
          }
        }

        @media (max-width: 480px) {
          .login-form-card {
            padding: 1.5rem 1rem !important;
            margin: 0.25rem !important;
            border-radius: 16px !important;
            max-width: calc(100vw - 0.5rem) !important;
          }
          
          .login-header-icon {
            width: 60px !important;
            height: 60px !important;
          }
          
          .login-header-title {
            font-size: 1.75rem !important;
          }
        }
      `}</style>
      <div className="login-container login-floating-elements">
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative'
      }}>
        {/* Form Container */}
        <div className="login-form-card" style={{
          borderRadius: '24px',
          padding: '2.5rem 2.5rem',
          width: '100%',
          maxWidth: '450px',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div className="login-header-icon" style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '70px',
              height: '70px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              borderRadius: '18px',
              marginBottom: '1rem',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
              position: 'relative'
            }}>
              <GraduationCap style={{ width: '35px', height: '35px', color: 'white' }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none'
              }} />
            </div>
            <h2 className="login-header-title" style={{ 
              margin: '0',
              fontSize: '2rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #1f2937 0%, #047857 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.25rem',
              letterSpacing: '-0.025em'
            }}>
              Bienvenido
            </h2>
            <p style={{ 
              margin: '0',
              fontSize: '1rem',
              color: '#6b7280',
              fontWeight: '400'
            }}>
              Inicia sesión en tu cuenta
            </p>
          </div>

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)'
            }}>
              <AlertCircle size={20} color="#dc2626" />
              <span style={{ 
                color: '#dc2626', 
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem' 
          }}>
            {/* Email */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={20} 
                  style={iconStyle}
                />
                <input
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={20} 
                  style={iconStyle}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input"
                  style={{...inputStyle, paddingRight: '3rem'}}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <span style={{ 
                position: 'relative', 
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                {isLoading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Iniciar Sesión
                  </>
                )}
              </span>
            </button>

            {/* Register Link */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '1.5rem',
              padding: '1rem 0',
              borderTop: '1px solid #f3f4f6'
            }}>
              <span style={{ 
                color: '#6b7280', 
                fontSize: '0.9rem',
                fontWeight: '400'
              }}>
                ¿No tienes una cuenta?{' '}
              </span>
              <button
                type="button"
                onClick={handleRegisterClick}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                <UserPlus size={16} />
                Regístrate aquí
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;