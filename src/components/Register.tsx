import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, IdCard, GraduationCap, Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import Api from './Api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    idNumber: '',
    role: 'Alumno',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      await Api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        lastName: formData.lastName,
        idNumber: formData.idNumber,
        role: formData.role
      });
      navigate('/login');
    } catch (err) {
      setError('Hubo un error al registrar la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Estilos inline para mantener consistencia con Login
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
    width: '420px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    backgroundColor: '#fff',
    maxHeight: '90vh',
    overflowY: 'auto' as const
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
    padding: '30px',
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

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '40px',
    appearance: 'none' as const
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
    margin: '15px 0 0 0'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#95a5a6',
    marginTop: '10px'
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

  const rowStyle = {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px'
  };

  const halfWidthStyle = {
    flex: '1'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ marginBottom: '20px' }}>
            <UserPlus size={48} color="white" />
          </div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            color: 'white'
          }}>
            Registro
          </h1>
          <p style={{ 
            fontSize: '14px', 
            margin: '0',
            opacity: 0.9,
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Crea tu cuenta para acceder al sistema
          </p>
        </div>

        {/* Form */}
        <div style={formContainerStyle}>
          <form onSubmit={handleRegister}>
            
            {/* Nombre y Apellido - Fila */}
            <div style={rowStyle}>
              <div style={halfWidthStyle}>
                <label style={labelStyle}>Nombre</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#16a085'}
                    onBlur={(e) => e.target.style.borderColor = '#4a5a6b'}
                    required
                  />
                </div>
              </div>
              <div style={halfWidthStyle}>
                <label style={labelStyle}>Apellido</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#16a085'}
                    onBlur={(e) => e.target.style.borderColor = '#4a5a6b'}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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

            {/* Número de Identificación */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Número de Identificación</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyle,
                    paddingRight: '45px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#16a085'}
                  onBlur={(e) => e.target.style.borderColor = '#4a5a6b'}
                  required
                />
                <IdCard 
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

            {/* Rol en la Universidad */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Rol en la Universidad</label>
              <div style={{ position: 'relative' }}>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={selectStyle}
                  onFocus={(e) => e.target.style.borderColor = '#16a085'}
                  onBlur={(e) => e.target.style.borderColor = '#4a5a6b'}
                  required
                >
                  <option value="Alumno" style={{ backgroundColor: '#34495e', color: 'white' }}>Alumno</option>
                  <option value="Profesor" style={{ backgroundColor: '#34495e', color: 'white' }}>Profesor</option>
                  <option value="Administrativo" style={{ backgroundColor: '#34495e', color: 'white' }}>Administrativo</option>
                </select>
                <GraduationCap 
                  size={20} 
                  color="#95a5a6" 
                  style={{
                    position: 'absolute',
                    right: '35px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
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

            {/* Confirmar Contraseña */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Confirmar Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? 
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

            {/* Register Button */}
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
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>REGISTRARSE</span>
                </>
              )}
            </button>

            {/* Back to Login Button */}
            <button
              type="button"
              onClick={handleBackToLogin}
              style={secondaryButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7f8c8d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#95a5a6'}
            >
              <ArrowLeft size={20} />
              <span>VOLVER AL LOGIN</span>
            </button>
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

export default Register;