import React from 'react';
import { Users, LogOut } from 'lucide-react';

const UserManagementSimple: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #f8fdfa 0%, #ecf9f5 100%)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
        color: '#ffffff',
        padding: '20px',
        borderRadius: '16px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(22, 160, 133, 0.3)'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
            Gestión de Usuarios
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>
            Administra y controla los usuarios del sistema
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>

      {/* Content */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        textAlign: 'center' as const,
        flex: 1
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          color: '#ffffff'
        }}>
          <Users size={40} />
        </div>
        
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Gestión de Usuarios
        </h2>
        
        <p style={{ 
          color: '#7f8c8d', 
          fontSize: '16px',
          lineHeight: '1.6',
          maxWidth: '500px',
          margin: '0 auto 30px'
        }}>
          Esta página está funcionando correctamente. El componente de gestión de usuarios 
          se está cargando desde React Router.
        </p>

        <div style={{
          background: '#e8f5e8',
          color: '#2e7d32',
          padding: '15px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #c8e6c8'
        }}>
          ✅ Componente cargado exitosamente
        </div>

        <div style={{
          background: '#e3f2fd',
          color: '#1976d2',
          padding: '15px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #bbdefb'
        }}>
          📍 Ruta: /admin/gestion-usuarios.html
        </div>

        <button
          onClick={() => window.close()}
          style={{
            background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginRight: '10px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #16a085 0%, #138d75 100%)';
          }}
        >
          Cerrar Pestaña
        </button>

        <button
          onClick={() => window.location.href = '/chat'}
          style={{
            background: '#f8f9fa',
            color: '#6c757d',
            border: '1px solid #dee2e6',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e9ecef';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f8f9fa';
          }}
        >
          Ir al Chat
        </button>
      </div>
    </div>
  );
};

export default UserManagementSimple;
