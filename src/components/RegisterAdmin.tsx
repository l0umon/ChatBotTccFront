import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  IdCard, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  UserPlus, 
  User,
  Shield,
  Briefcase,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    idNumber: '',
    role: 'alumno',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('alumno');

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'role') {
      setSelectedRole(value);
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    // Validate role selection
    if (!formData.role) {
      setError('Selecciona tu rol en la universidad');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      setError('Creando cuenta...');
      
      // Preparar datos en formato JSON como espera el backend
      const registerData = {
        nombre: formData.name,
        apellido: formData.lastName,
        email: formData.email,
        numero_identificacion: formData.idNumber,
        rol: formData.role,
        password: formData.password
      };

      console.log('Enviando datos:', registerData);

      // Usando fetch con JSON como en tu backend actualizado
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Verificar si la respuesta tiene contenido antes de parsear JSON
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!responseText) {
        throw new Error('El servidor devolvió una respuesta vacía');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error(`Respuesta del servidor no es JSON válido: ${responseText}`);
      }

      if (response.ok && data.success) {
        // Éxito - exactamente como tu código JavaScript original
       // alert('Usuario registrado exitosamente');
        
        // Guardar token y datos del usuario
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        
        // Redirigir usando React Router en lugar de window.location
        navigate('/chat');
      } else {
        // Error - mostrar mensaje del servidor
        const errorMessage = data.message || data.error?.message || `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);
      }
    } catch (error: unknown) {
      console.error('Register error:', error);
      
      const err = error as { 
        code?: string; 
        response?: { 
          status?: number; 
          data?: { message?: string } 
        }; 
        message?: string 
      };
      
      // Handle connection errors (adapting your original error handling)
      if (err.code === 'ERR_NETWORK' || err.response?.status === 404) {
        setError('Error de conexión. Intenta nuevamente.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error de conexión. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Register component styles - Professional UI/UX Design */
        .register-container {
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

        .register-container * {
          color-scheme: light !important;
          box-sizing: border-box !important;
        }

        .register-form-card {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1) !important;
          max-width: 520px !important;
        }

        .register-input {
          background: rgba(255, 255, 255, 0.9) !important;
          color: #1f2937 !important;
          border: 2px solid #e5e7eb !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }

        .register-input:focus {
          background: white !important;
          color: #1f2937 !important;
          border-color: #10b981 !important;
          box-shadow: 
            0 0 0 3px rgba(16, 185, 129, 0.1),
            0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
          outline: none !important;
        }

        .register-input:hover {
          border-color: #10b981 !important;
        }

        .register-input::placeholder {
          color: #9ca3af !important;
        }

        .register-input::-webkit-input-placeholder {
          color: #9ca3af !important;
        }

        .register-input::-moz-placeholder {
          color: #9ca3af !important;
        }

        .register-role-option {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(10px) !important;
        }

        .register-role-option:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
        }

        .register-role-option.selected {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
          border-color: #10b981 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 20px -5px rgba(16, 185, 129, 0.2) !important;
        }

        .register-button {
          background: linear-gradient(135deg, #10b981 0%, #047857 100%) !important;
          color: white !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.2) !important;
        }

        .register-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #065f46 100%) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.3) !important;
        }

        .register-button:disabled {
          background: #9ca3af !important;
          transform: none !important;
          box-shadow: none !important;
        }

        .register-floating-elements::before,
        .register-floating-elements::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 6s ease-in-out infinite;
        }

        .register-floating-elements::before {
          width: 200px;
          height: 200px;
          top: 10%;
          left: -10%;
          animation-delay: 0s;
        }

        .register-floating-elements::after {
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

        .register-glass-effect {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .register-container {
            padding: 0.5rem !important;
          }
          
          .register-form-card {
            padding: 2rem 1.5rem !important;
            margin: 0.5rem !important;
            max-width: calc(100vw - 1rem) !important;
          }
          
          .register-role-grid {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          
          .register-role-option {
            flex-direction: row !important;
            padding: 0.75rem 1rem !important;
            gap: 0.75rem !important;
            justify-content: flex-start !important;
          }
        }

        @media (max-width: 480px) {
          .register-form-card {
            padding: 1.5rem 1rem !important;
            margin: 0.25rem !important;
            border-radius: 16px !important;
            max-width: calc(100vw - 0.5rem) !important;
          }
          
          .register-header-icon {
            width: 60px !important;
            height: 60px !important;
          }
          
          .register-header-title {
            font-size: 1.75rem !important;
          }

          .register-role-grid {
            flex-direction: column !important;
          }

          .register-role-option {
            flex-direction: row !important;
            justify-content: flex-start !important;
            text-align: left !important;
          }
        }
      `}</style>
      <div className="register-container register-floating-elements">
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative'
      }}>
        {/* Form Container */}
        <div className="register-form-card" style={{
          borderRadius: '24px',
          padding: '2.5rem 2.5rem',
          width: '100%',
          maxWidth: '520px',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div className="register-header-icon" style={{ 
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
              <UserPlus style={{ width: '35px', height: '35px', color: 'white' }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none'
              }} />
            </div>
            <h2 className="register-header-title" style={{ 
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
              Crear Cuenta
            </h2>
            <p style={{ 
              margin: '0',
              fontSize: '1rem',
              color: '#6b7280',
              fontWeight: '400'
            }}>
              Únete a nuestra comunidad universitaria
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

          <form onSubmit={handleSubmit} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem' 
          }}>
            {/* Nombre */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Nombre
              </label>
              <div style={{ position: 'relative' }}>
                <User 
                  size={20} 
                  style={iconStyle}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Ingresa tu nombre"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="register-input"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Apellido */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Apellido
              </label>
              <div style={{ position: 'relative' }}>
                <User 
                  size={20} 
                  style={iconStyle}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Ingresa tu apellido"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="register-input"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={20} 
                  style={iconStyle}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="tu.email@universidad.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="register-input"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* ID Number */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Número de identificación
              </label>
              <div style={{ position: 'relative' }}>
                <IdCard 
                  size={20} 
                  style={iconStyle}
                />
                <input
                  type="text"
                  name="idNumber"
                  placeholder="123456789"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  required
                  className="register-input"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '1rem', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Selecciona tu rol
              </label>
              <div className="register-role-grid" style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'space-between'
              }}>
                {[
                  { 
                    value: 'alumno', 
                    label: 'Alumno', 
                    icon: GraduationCap,
                    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  },
                  { 
                    value: 'personal', 
                    label: 'Personal', 
                    icon: Briefcase,
                    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                  },
                  { 
                    value: 'administrador', 
                    label: 'Admin', 
                    icon: Shield,
                    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  }
                ].map((roleOption) => (
                  <div
                    key={roleOption.value}
                    onClick={() => {
                      setSelectedRole(roleOption.value);
                      setFormData(prev => ({ ...prev, role: roleOption.value }));
                    }}
                    className={`register-role-option ${selectedRole === roleOption.value ? 'selected' : ''}`}
                    style={{
                      padding: '0.75rem 0.5rem',
                      border: `2px solid ${selectedRole === roleOption.value ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      position: 'relative',
                      overflow: 'hidden',
                      flex: '1',
                      minWidth: '0'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: selectedRole === roleOption.value ? roleOption.gradient : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      <roleOption.icon 
                        size={18} 
                        color={selectedRole === roleOption.value ? 'white' : '#6b7280'} 
                      />
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: selectedRole === roleOption.value ? '#10b981' : '#374151'
                    }}>
                      {roleOption.label}
                    </div>
                    {selectedRole === roleOption.value && (
                      <div style={{
                        position: 'absolute',
                        top: '0.375rem',
                        right: '0.375rem',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 0 2px white'
                      }} />
                    )}
                  </div>
                ))}
              </div>
              <input
                type="hidden"
                name="role"
                value={selectedRole}
              />
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
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="register-input"
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

            {/* Confirm Password */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Confirmar contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={20} 
                  style={iconStyle}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="register-input"
                  style={{...inputStyle, paddingRight: '3rem'}}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="register-button"
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
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Crear Cuenta
                  </>
                )}
              </span>
            </button>

            {/* Botón Volver */}
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                marginTop: '1rem',
                background: 'transparent',
                border: '2px solid #10b981',
                borderRadius: '12px',
                color: '#10b981',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                letterSpacing: '0.025em',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#10b981';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px 0 rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              <ArrowLeft size={20} />
              Volver
            </button>

          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default RegisterAdmin;
