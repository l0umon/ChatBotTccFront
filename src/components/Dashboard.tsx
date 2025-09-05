import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, Shield, User, BarChart3, MessageSquare, ArrowRight } from 'lucide-react';

interface DashboardStats {
  total: number;
  estudiantes: number;
  personal: number;
  administradores: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetch('/api/admin/dashboard-stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setStats(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar estadísticas');
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando estadísticas...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>;
  if (!stats) return null;

  const containerStyle = {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #047857 0%, #065f46 25%, #064e3b 50%, #0f172a 100%)',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: isMobile ? 'column' as const : 'row' as const,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    overflow: 'hidden'
  };

  const sidebarStyle = {
    width: isMobile ? '100%' : '280px',
    height: isMobile ? 'auto' : '100vh',
    maxHeight: isMobile ? '200px' : 'none',
    background: 'linear-gradient(145deg, #064e3b 0%, #065f46 50%, #047857 100%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: isMobile 
      ? '0 8px 32px rgba(5, 95, 70, 0.15)' 
      : '8px 0 32px rgba(5, 95, 70, 0.15)',
    overflowY: isMobile ? 'auto' as const : 'visible' as const,
    flexShrink: 0,
    backdropFilter: 'blur(10px)',
    borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
  };

  const mainContentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    height: isMobile ? 'calc(100vh - 200px)' : '100vh',
    background: 'rgba(15, 23, 42, 0.3)',
    backdropFilter: 'blur(10px)',
    borderLeft: isMobile ? 'none' : '1px solid rgba(16, 185, 129, 0.2)'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)',
    color: '#ffffff',
    padding: isMobile ? '20px 24px' : '24px 32px',
    boxShadow: '0 8px 32px rgba(4, 120, 87, 0.25)',
    flexShrink: 0,
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    minHeight: '76px',
    display: 'flex',
    alignItems: 'center'
  };

  const contentStyle = {
    flex: 1,
    padding: isMobile ? '20px' : '32px',
    overflowY: 'auto' as const,
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
  };

  const cardStyle = (gradient: string, shadowColor: string) => ({
    background: `linear-gradient(145deg, ${gradient})`,
    borderRadius: '20px',
    boxShadow: `0 12px 40px ${shadowColor}12, 0 4px 20px ${shadowColor}08`,
    padding: isMobile ? '20px' : '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: isMobile ? '12px' : '16px',
    minHeight: isMobile ? '140px' : '180px',
    justifyContent: 'space-between',
    transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative' as const,
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    cursor: 'pointer',
    transform: 'translateY(0) scale(1)',
    ':hover': {
      transform: 'translateY(-6px) scale(1.02)',
      boxShadow: `0 20px 60px ${shadowColor}20, 0 8px 30px ${shadowColor}12`
    }
  });

  const imageContainerStyle = (bgColor: string) => ({
    width: isMobile ? '60px' : '70px',
    height: isMobile ? '60px' : '70px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${bgColor}20 0%, ${bgColor}40 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${bgColor}30`,
    boxShadow: `0 8px 24px ${bgColor}15`,
    position: 'relative' as const,
    overflow: 'hidden'
  });

  const floatingElementStyle = {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float 3s ease-in-out infinite'
  };

  const contentContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: isMobile ? '8px' : '12px',
    textAlign: 'center' as const,
    width: '100%'
  };

  const countStyle = (isMobile: boolean) => ({
    fontSize: isMobile ? '28px' : '36px',
    fontWeight: 900,
    color: '#ffffff',
    margin: 0,
    lineHeight: 1,
    textShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    letterSpacing: '-0.5px'
  });

  const labelStyle = (isMobile: boolean) => ({
    fontSize: isMobile ? '11px' : '13px',
    color: 'rgba(255, 255, 255, 0.95)',
    margin: 0,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    lineHeight: 1.2
  });

  const decorativeElementStyle = {
    position: 'absolute' as const,
    top: '-50%',
    right: '-20%',
    width: '100px',
    height: '100px',
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    borderRadius: '50%',
    opacity: 0.6
  };

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        {/* Logo */}
        <div style={{ 
          padding: isMobile ? '16px 20px' : '24px 24px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '12px' : '16px',
          minHeight: isMobile ? 'auto' : '76px',
          height: isMobile ? 'auto' : '76px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '8px' : '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(4, 120, 87, 0.3)'
          }}>
            <GraduationCap size={isMobile ? 20 : 28} color="#ffffff" />
          </div>
          <div>
            <div style={{ 
              fontWeight: '700', 
              fontSize: isMobile ? '16px' : '18px', 
              lineHeight: '1.2',
              color: '#ffffff'
            }}>
              ChatBot Universitario
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: isMobile ? '15px' : '20px' }}>
          <div style={{ marginBottom: isMobile ? '20px' : '30px' }}>
            <span style={{ 
              color: '#bdc3c7', 
              fontSize: isMobile ? '11px' : '12px', 
              fontWeight: '600', 
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '15px',
              display: 'block'
            }}>
              Navegación
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
              <button
                style={{
                  background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: isMobile ? '12px 16px' : '14px 18px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '12px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '100%',
                  textAlign: 'left' as const,
                  boxShadow: '0 4px 20px rgba(4, 120, 87, 0.25)',
                  transform: 'translateY(0)'
                }}
              >
                <BarChart3 size={18} />
                Dashboard
              </button>

              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  padding: isMobile ? '12px 16px' : '14px 18px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '12px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '100%',
                  textAlign: 'left' as const,
                  backdropFilter: 'blur(10px)'
                }}
                onClick={() => window.location.href = '/admin/gestion-usuarios.html'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <Users size={18} />
                Gestión de Usuarios
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginLeft: 'auto',
                  backdropFilter: 'blur(10px)'
                }}>
                  {stats.total}
                </span>
              </button>

              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  padding: isMobile ? '12px 16px' : '14px 18px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '12px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '100%',
                  textAlign: 'left' as const,
                  backdropFilter: 'blur(10px)'
                }}
                onClick={() => window.location.href = '/chat'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <MessageSquare size={18} />
                Chat
              </button>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div style={{ 
          padding: isMobile ? '15px' : '20px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '10px' : '12px'
        }}>
          {/* User Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '10px' : '12px',
            flex: 1,
            minWidth: 0
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={isMobile ? 18 : 20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontWeight: '600', 
                fontSize: isMobile ? '13px' : '14px',
                whiteSpace: 'nowrap' as const,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>Administrador</div>
              <div style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                opacity: 0.7,
                whiteSpace: 'nowrap' as const
              }}>Admin</div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '8px',
              padding: isMobile ? '8px' : '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
            }}
            title="Cerrar Sesión"
          >
            <ArrowRight size={isMobile ? 16 : 18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%'
          }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: isMobile ? '24px' : '28px', 
                fontWeight: '700',
                lineHeight: '1.2',
                color: '#ffffff',
                marginBottom: '4px'
              }}>
                Dashboard
              </h1>
              <p style={{ 
                margin: 0, 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '500',
                lineHeight: '1.2'
              }}>
                Panel de control y estadísticas del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* CSS Animation Keyframes */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              33% { transform: translateY(-10px) rotate(120deg); }
              66% { transform: translateY(-5px) rotate(240deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
          `}</style>
          
          {/* Stats Grid - Professional card layout */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: isMobile ? '16px' : '24px', 
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '20px' : '30px 20px',
            alignItems: 'start'
          }}>
            {/* Total Usuarios Card */}
            <div 
              style={cardStyle('#8b5cf6 0%, #a855f7 50%, #9333ea 100%', '#8b5cf6')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 60px #8b5cf620, 0 8px 30px #8b5cf612';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 40px #8b5cf612, 0 4px 20px #8b5cf608';
              }}
            >
              <div style={decorativeElementStyle}></div>
              
              {/* User Community Icon/Image */}
              <div style={imageContainerStyle('#8b5cf6')}>
                <div style={floatingElementStyle}></div>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff40 0%, #ffffff20 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <Users size={isMobile ? 24 : 28} color="#ffffff" strokeWidth={2.5} />
                  <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '15%',
                    width: '8px',
                    height: '8px',
                    background: '#ffffff60',
                    borderRadius: '50%',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}></div>
                </div>
              </div>
              
              <div style={contentContainerStyle}>
                <div style={countStyle(isMobile)}>{stats.total}</div>
                <div style={labelStyle(isMobile)}>Total Usuarios</div>
              </div>
            </div>
            
            {/* Estudiantes Card */}
            <div 
              style={cardStyle('#3b82f6 0%, #2563eb 50%, #1d4ed8 100%', '#3b82f6')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 60px #3b82f620, 0 8px 30px #3b82f612';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 40px #3b82f612, 0 4px 20px #3b82f608';
              }}
            >
              <div style={decorativeElementStyle}></div>
              
              {/* Student Academic Icon/Image */}
              <div style={imageContainerStyle('#3b82f6')}>
                <div style={floatingElementStyle}></div>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff40 0%, #ffffff20 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <GraduationCap size={isMobile ? 24 : 28} color="#ffffff" strokeWidth={2.5} />
                  <div style={{
                    position: 'absolute',
                    top: '5%',
                    right: '10%',
                    width: '6px',
                    height: '6px',
                    background: '#fbbf24',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px #fbbf24'
                  }}></div>
                </div>
              </div>
              
              <div style={contentContainerStyle}>
                <div style={countStyle(isMobile)}>{stats.estudiantes}</div>
                <div style={labelStyle(isMobile)}>Estudiantes</div>
              </div>
            </div>
            
            {/* Personal Card */}
            <div 
              style={cardStyle('#22c55e 0%, #16a34a 50%, #15803d 100%', '#22c55e')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 60px #22c55e20, 0 8px 30px #22c55e12';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 40px #22c55e12, 0 4px 20px #22c55e08';
              }}
            >
              <div style={decorativeElementStyle}></div>
              
              {/* Staff Professional Icon/Image */}
              <div style={imageContainerStyle('#22c55e')}>
                <div style={floatingElementStyle}></div>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff40 0%, #ffffff20 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <User size={isMobile ? 24 : 28} color="#ffffff" strokeWidth={2.5} />
                  <div style={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '15%',
                    width: '7px',
                    height: '7px',
                    background: '#06b6d4',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px #06b6d4'
                  }}></div>
                </div>
              </div>
              
              <div style={contentContainerStyle}>
                <div style={countStyle(isMobile)}>{stats.personal}</div>
                <div style={labelStyle(isMobile)}>Personal</div>
              </div>
            </div>
            
            {/* Administradores Card */}
            <div 
              style={cardStyle('#f59e0b 0%, #d97706 50%, #b45309 100%', '#f59e0b')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 60px #f59e0b20, 0 8px 30px #f59e0b12';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 40px #f59e0b12, 0 4px 20px #f59e0b08';
              }}
            >
              <div style={decorativeElementStyle}></div>
              
              {/* Admin Security Icon/Image */}
              <div style={imageContainerStyle('#f59e0b')}>
                <div style={floatingElementStyle}></div>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff40 0%, #ffffff20 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <Shield size={isMobile ? 24 : 28} color="#ffffff" strokeWidth={2.5} />
                  <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '20%',
                    width: '5px',
                    height: '5px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}></div>
                </div>
              </div>
              
              <div style={contentContainerStyle}>
                <div style={countStyle(isMobile)}>{stats.administradores}</div>
                <div style={labelStyle(isMobile)}>Administradores</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
