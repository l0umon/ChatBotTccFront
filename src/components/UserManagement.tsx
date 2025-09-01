import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  GraduationCap as UserGraduate, 
  UserCheck, 
  Shield, 
  UserX as UserSlash,
  Mail,
  IdCard,
  User as UserTag,
  CheckCircle,
  Settings,
  Edit,
  Trash2,
  X,
  Save,
  GraduationCap,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import Api from './Api';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  numero_identificacion: string;
  rol: string;
  activo: boolean;
  fecha_creacion?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    numero_identificacion: '',
    rol: 'alumno',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Detectar dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filterUsers = () => {
      let filtered = users;

      // Filtro por término de búsqueda
      if (searchTerm) {
        filtered = filtered.filter(user =>
          user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.numero_identificacion.includes(searchTerm)
        );
      }

      // Filtro por categoría
      switch (activeFilter) {
        case 'alumno':
          filtered = filtered.filter(user => user.rol === 'alumno');
          break;
        case 'personal':
          filtered = filtered.filter(user => user.rol === 'personal');
          break;
        case 'administrador':
          filtered = filtered.filter(user => user.rol === 'administrador');
          break;
        case 'blocked':
          filtered = filtered.filter(user => !user.activo);
          break;
        default:
          break;
      }

      setFilteredUsers(filtered);
    };

    filterUsers();
  }, [users, searchTerm, activeFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await Api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      await Api.put(`/admin/users/${editingUser.id}`, editingUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      const token = localStorage.getItem('token');
      await Api.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await Api.post('/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowRegisterModal(false);
      setNewUser({
        nombre: '',
        apellido: '',
        email: '',
        numero_identificacion: '',
        rol: 'alumno',
        password: ''
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await Api.patch(`/admin/users/${userId}/status`, 
        { activo: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const getCountByFilter = (filter: string) => {
    switch (filter) {
      case 'all':
        return users.length;
      case 'alumno':
        return users.filter(u => u.rol === 'alumno').length;
      case 'personal':
        return users.filter(u => u.rol === 'personal').length;
      case 'administrador':
        return users.filter(u => u.rol === 'administrador').length;
      case 'blocked':
        return users.filter(u => !u.activo).length;
      default:
        return 0;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  const containerStyle = {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
    height: isMobile ? 'calc(100vh - 200px)' : '100vh'
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
                <BarChart3 size={18} />
                Dashboard
              </button>

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
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(4, 120, 87, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(4, 120, 87, 0.25)';
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
                  {users.length}
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
                onClick={() => window.close()}
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
                Gestión de Usuarios
              </h1>
              <p style={{ 
                margin: 0, 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '500',
                lineHeight: '1.2'
              }}>
                Administra y controla los usuarios del sistema
              </p>
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: isMobile ? '12px 20px' : '14px 24px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '8px' : '10px',
                cursor: 'pointer',
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1)';
              }}
            >
              <UserPlus size={isMobile ? 16 : 18} />
              {isMobile ? 'Nuevo' : 'Registrar Usuario'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Search and Filters */}
          <div style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)', 
            borderRadius: '20px', 
            padding: isMobile ? '24px' : '32px', 
            marginBottom: isMobile ? '24px' : '32px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.1)'
          }}>
            {/* Search */}
            <div style={{ 
              position: 'relative',
              marginBottom: isMobile ? '20px' : '25px'
            }}>
              <Search 
                size={isMobile ? 18 : 20} 
                style={{ 
                  position: 'absolute', 
                  left: isMobile ? '16px' : '18px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#047857'
                }} 
              />
              <input
                type="text"
                placeholder={isMobile ? "Buscar usuarios..." : "Buscar usuarios por nombre, email o ID..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile ? '16px 16px 16px 48px' : '18px 20px 18px 54px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  fontSize: isMobile ? '14px' : '15px',
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxSizing: 'border-box' as const,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                  fontWeight: '500'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#047857';
                  e.target.style.boxShadow = '0 0 0 4px rgba(4, 120, 87, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? '8px' : '12px', 
              flexWrap: 'wrap',
              overflowX: isMobile ? 'auto' : 'visible',
              paddingBottom: isMobile ? '10px' : '0'
            }}>
              {[
                { key: 'all', icon: Users, label: 'Todos' },
                { key: 'alumno', icon: UserGraduate, label: isMobile ? 'Estudiantes' : 'Estudiantes' },
                { key: 'personal', icon: UserCheck, label: 'Personal' },
                { key: 'administrador', icon: Shield, label: isMobile ? 'Admin' : 'Administradores' },
                { key: 'blocked', icon: UserSlash, label: isMobile ? 'Bloq.' : 'Bloqueados' }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  style={{
                    background: activeFilter === key 
                      ? 'linear-gradient(135deg, #047857 0%, #065f46 100%)' 
                      : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    color: activeFilter === key ? '#ffffff' : '#374151',
                    border: activeFilter === key 
                      ? '1px solid rgba(255, 255, 255, 0.3)' 
                      : '1px solid #d1d5db',
                    padding: isMobile ? '10px 16px' : '12px 20px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '6px' : '8px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: isMobile ? 'auto' : 'auto',
                    whiteSpace: 'nowrap' as const,
                    boxShadow: activeFilter === key 
                      ? '0 4px 20px rgba(16, 185, 129, 0.25)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeFilter !== key) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                    } else {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.35)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilter !== key) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                    } else {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.25)';
                    }
                  }}
                >
                  <Icon size={isMobile ? 14 : 16} />
                  {label}
                  <span style={{
                    background: activeFilter === key 
                      ? 'rgba(255, 255, 255, 0.25)' 
                      : '#047857',
                    color: activeFilter === key ? '#ffffff' : '#ffffff',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: isMobile ? '10px' : '12px',
                    fontWeight: '700',
                    minWidth: '24px',
                    textAlign: 'center' as const,
                    backdropFilter: 'blur(10px)',
                    boxShadow: activeFilter === key 
                      ? 'none' 
                      : '0 2px 8px rgba(4, 120, 87, 0.3)'
                  }}>
                    {getCountByFilter(key)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ 
              padding: '25px 30px', 
              borderBottom: '1px solid #ecf0f1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={20} color="#047857" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Lista de Usuarios</h3>
              </div>
              <span style={{ 
                color: '#7f8c8d', 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {filteredUsers.length} usuarios
              </span>
            </div>

            {loading ? (
              <div style={{ 
                padding: '60px', 
                textAlign: 'center' as const,
                color: '#7f8c8d'
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '4px solid #ecf0f1',
                  borderTop: '4px solid #16a085',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }}></div>
                Cargando usuarios...
              </div>
            ) : (
              <div style={{ 
                overflowX: 'auto' as const,
                width: '100%',
                maxWidth: '100%',
                borderRadius: '12px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                backgroundColor: '#ffffff'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse' as const,
                  minWidth: isMobile ? 'auto' : '800px',
                  fontSize: isMobile ? '12px' : '14px'
                }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)' }}>
                      <th style={{ 
                        padding: isMobile ? '16px 12px' : '20px 24px', 
                        textAlign: 'left' as const, 
                        fontWeight: '700',
                        color: '#ffffff',
                        fontSize: isMobile ? '12px' : '15px',
                        whiteSpace: isMobile ? 'nowrap' as const : 'normal' as const,
                        borderBottom: '3px solid #059669',
                        letterSpacing: '0.5px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserCheck size={isMobile ? 14 : 16} />
                          Usuario
                        </div>
                      </th>
                      <th style={{ 
                        padding: isMobile ? '16px 12px' : '20px 24px', 
                        textAlign: 'left' as const, 
                        fontWeight: '700',
                        color: '#ffffff',
                        fontSize: isMobile ? '12px' : '15px',
                        whiteSpace: isMobile ? 'nowrap' as const : 'normal' as const,
                        borderBottom: '3px solid #34d399',
                        letterSpacing: '0.5px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={isMobile ? 16 : 18} />
                          Email
                        </div>
                      </th>
                      <th style={{ 
                        padding: isMobile ? '16px 12px' : '20px 24px', 
                        textAlign: 'left' as const, 
                        fontWeight: '700',
                        color: '#ffffff',
                        fontSize: isMobile ? '12px' : '15px',
                        whiteSpace: isMobile ? 'nowrap' as const : 'normal' as const,
                        borderBottom: '3px solid #34d399',
                        letterSpacing: '0.5px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <IdCard size={isMobile ? 16 : 18} />
                          {isMobile ? 'ID' : 'Identificación'}
                        </div>
                      </th>
                      <th style={{ 
                        padding: isMobile ? '16px 12px' : '20px 24px', 
                        textAlign: 'left' as const, 
                        fontWeight: '700',
                        color: '#ffffff',
                        fontSize: isMobile ? '12px' : '15px',
                        whiteSpace: isMobile ? 'nowrap' as const : 'normal' as const,
                        borderBottom: '3px solid #34d399',
                        letterSpacing: '0.5px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserTag size={isMobile ? 16 : 18} />
                          Rol
                        </div>
                      </th>
                      <th style={{ 
                        padding: isMobile ? '16px 12px' : '20px 24px', 
                        textAlign: 'left' as const, 
                        fontWeight: '700',
                        color: '#ffffff',
                        fontSize: isMobile ? '12px' : '15px',
                        whiteSpace: isMobile ? 'nowrap' as const : 'normal' as const,
                        borderBottom: '3px solid #34d399',
                        letterSpacing: '0.5px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={isMobile ? 16 : 18} />
                          Estado
                        </div>
                      </th>
                      <th style={{ 
                        padding: isMobile ? '16px 12px' : '20px 24px', 
                        textAlign: 'left' as const, 
                        fontWeight: '700',
                        color: '#ffffff',
                        fontSize: isMobile ? '12px' : '15px',
                        whiteSpace: isMobile ? 'nowrap' as const : 'normal' as const,
                        borderBottom: '3px solid #34d399',
                        letterSpacing: '0.5px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Settings size={isMobile ? 16 : 18} />
                          Acciones
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr 
                        key={user.id}
                        style={{ 
                          borderBottom: '1px solid #f1f3f4',
                          background: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                        }}
                      >
                        <td style={{ 
                          padding: isMobile ? '12px 8px' : '20px',
                          borderBottom: '1px solid #ecf0f1'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
                            <div style={{
                              width: isMobile ? '36px' : '44px',
                              height: isMobile ? '36px' : '44px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontWeight: '700',
                              fontSize: isMobile ? '12px' : '15px',
                              boxShadow: '0 4px 20px rgba(4, 120, 87, 0.3)',
                              border: '2px solid #ffffff'
                            }}>
                              {user.nombre.charAt(0) + user.apellido.charAt(0)}
                            </div>
                            <div>
                              <div style={{ 
                                fontWeight: '600', 
                                color: '#2c3e50', 
                                fontSize: isMobile ? '12px' : '14px',
                                lineHeight: '1.3'
                              }}>
                                {user.nombre} {user.apellido}
                              </div>
                              <div style={{ 
                                color: '#7f8c8d', 
                                fontSize: isMobile ? '10px' : '12px',
                                display: isMobile ? 'none' : 'block'
                              }}>
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          padding: isMobile ? '12px 8px' : '20px', 
                          color: '#2c3e50', 
                          fontSize: isMobile ? '11px' : '14px',
                          borderBottom: '1px solid #ecf0f1',
                          maxWidth: isMobile ? '120px' : 'none',
                          wordBreak: isMobile ? 'break-word' as const : 'normal' as const
                        }}>
                          {user.email}
                        </td>
                        <td style={{ 
                          padding: isMobile ? '12px 8px' : '20px', 
                          color: '#2c3e50', 
                          fontSize: isMobile ? '11px' : '14px',
                          borderBottom: '1px solid #ecf0f1'
                        }}>
                          {user.numero_identificacion || 'N/A'}
                        </td>
                        <td style={{ 
                          padding: isMobile ? '12px 8px' : '20px',
                          borderBottom: '1px solid #ecf0f1'
                        }}>
                          <span style={{
                            padding: isMobile ? '6px 12px' : '8px 16px',
                            borderRadius: '20px',
                            fontSize: isMobile ? '11px' : '13px',
                            fontWeight: '700',
                            background: user.rol === 'administrador' 
                              ? 'linear-gradient(135deg, #047857 0%, #065f46 100%)' 
                              : user.rol === 'personal' 
                              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#ffffff',
                            whiteSpace: 'nowrap' as const,
                            boxShadow: user.rol === 'administrador' 
                              ? '0 4px 16px rgba(4, 120, 87, 0.3)' 
                              : user.rol === 'personal' 
                              ? '0 4px 16px rgba(245, 158, 11, 0.3)' 
                              : '0 4px 16px rgba(59, 130, 246, 0.3)',
                            letterSpacing: '0.3px'
                          }}>
                            {user.rol === 'administrador' ? 'Admin' : 
                             user.rol === 'personal' ? 'Personal' : 'Estudiante'}
                          </span>
                        </td>
                        <td style={{ 
                          padding: isMobile ? '12px 8px' : '20px',
                          borderBottom: '1px solid #ecf0f1'
                        }}>
                          <span style={{
                            padding: isMobile ? '6px 12px' : '8px 16px',
                            borderRadius: '20px',
                            fontSize: isMobile ? '11px' : '13px',
                            fontWeight: '700',
                            background: user.activo 
                              ? 'linear-gradient(135deg, #047857 0%, #065f46 100%)' 
                              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: '#ffffff',
                            whiteSpace: 'nowrap' as const,
                            boxShadow: user.activo 
                              ? '0 4px 16px rgba(4, 120, 87, 0.3)' 
                              : '0 4px 16px rgba(239, 68, 68, 0.3)',
                            letterSpacing: '0.3px'
                          }}>
                            {user.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ 
                          padding: isMobile ? '12px 8px' : '20px',
                          borderBottom: '1px solid #ecf0f1'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            gap: isMobile ? '4px' : '8px',
                            flexDirection: isMobile ? 'column' : 'row'
                          }}>
                            <button
                              onClick={() => handleEditUser(user)}
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                color: '#ffffff',
                                borderRadius: '10px',
                                width: isMobile ? '32px' : '40px',
                                height: isMobile ? '32px' : '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                                transform: 'translateY(0)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
                              }}
                            >
                              <Edit size={isMobile ? 16 : 18} />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user.id, user.activo)}
                              style={{
                                background: user.activo 
                                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                color: '#ffffff',
                                borderRadius: '10px',
                                width: isMobile ? '32px' : '40px',
                                height: isMobile ? '32px' : '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: user.activo 
                                  ? '0 4px 16px rgba(239, 68, 68, 0.3)' 
                                  : '0 4px 16px rgba(16, 185, 129, 0.3)',
                                transform: 'translateY(0)'
                              }}
                              onMouseEnter={(e) => {
                                if (user.activo) {
                                  e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
                                } else {
                                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                                }
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = user.activo 
                                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                                e.currentTarget.style.boxShadow = user.activo 
                                  ? '0 4px 16px rgba(239, 68, 68, 0.3)' 
                                  : '0 4px 16px rgba(16, 185, 129, 0.3)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              {user.activo ? <UserSlash size={isMobile ? 16 : 18} /> : <CheckCircle size={isMobile ? 16 : 18} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              style={{
                                background: '#ffebee',
                                border: 'none',
                                color: '#c62828',
                                borderRadius: '8px',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ffcdd2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffebee';
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div style={{
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '10px' : '0'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: isMobile ? '95vw' : '500px',
            maxWidth: isMobile ? '95vw' : '500px',
            maxHeight: '90vh',
            overflowY: 'auto' as const,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: isMobile ? '20px' : '25px 30px',
              borderBottom: '1px solid #ecf0f1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit size={isMobile ? 18 : 20} color="#047857" />
                Editar Usuario
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7f8c8d',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.color = '#2c3e50';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#7f8c8d';
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} style={{ padding: isMobile ? '20px' : '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editingUser.nombre}
                    onChange={(e) => setEditingUser({...editingUser, nombre: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ecf0f1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box' as const
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a085';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ecf0f1';
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={editingUser.apellido}
                    onChange={(e) => setEditingUser({...editingUser, apellido: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ecf0f1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box' as const
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a085';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ecf0f1';
                    }}
                    required
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box' as const
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16a085';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ecf0f1';
                  }}
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Rol
                  </label>
                  <select
                    value={editingUser.rol}
                    onChange={(e) => setEditingUser({...editingUser, rol: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ecf0f1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box' as const,
                      background: '#ffffff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a085';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ecf0f1';
                    }}
                    required
                  >
                    <option value="alumno">Estudiante</option>
                    <option value="personal">Personal</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Estado
                  </label>
                  <select
                    value={editingUser.activo.toString()}
                    onChange={(e) => setEditingUser({...editingUser, activo: e.target.value === 'true'})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ecf0f1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box' as const,
                      background: '#ffffff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a085';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ecf0f1';
                    }}
                    required
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                  Número de Identificación
                </label>
                <input
                  type="text"
                  value={editingUser.numero_identificacion}
                  onChange={(e) => setEditingUser({...editingUser, numero_identificacion: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box' as const
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16a085';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ecf0f1';
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    background: '#f8f9fa',
                    border: 'none',
                    color: '#6c757d',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e9ecef';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                  }}
                >
                  <X size={16} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #047857 0%, #065f46 100%)';
                  }}
                >
                  <Save size={16} />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register User Modal */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '10px' : '0'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: isMobile ? '95vw' : '500px',
            maxWidth: isMobile ? '95vw' : '500px',
            maxHeight: '90vh',
            overflowY: 'auto' as const,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: isMobile ? '20px' : '25px 30px',
              borderBottom: '1px solid #ecf0f1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={isMobile ? 18 : 20} color="#047857" />
                Registrar Usuario
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7f8c8d',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.color = '#2c3e50';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#7f8c8d';
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} style={{ padding: isMobile ? '20px' : '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newUser.nombre}
                    onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ecf0f1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box' as const
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a085';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ecf0f1';
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={newUser.apellido}
                    onChange={(e) => setNewUser({...newUser, apellido: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ecf0f1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box' as const
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a085';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ecf0f1';
                    }}
                    required
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ecf0f1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box' as const
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16a085';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ecf0f1';
                  }}
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Número de Identificación
                  </label>
                  <input
                    type="text"
                    value={newUser.numero_identificacion}
                    onChange={(e) => setNewUser({...newUser, numero_identificacion: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ecf0f1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box' as const
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a085';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ecf0f1';
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Rol
                  </label>
                  <select
                    value={newUser.rol}
                    onChange={(e) => setNewUser({...newUser, rol: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ecf0f1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box' as const,
                      background: '#ffffff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a085';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ecf0f1';
                    }}
                    required
                  >
                    <option value="alumno">Estudiante</option>
                    <option value="personal">Personal</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 12px',
                      border: '2px solid #ecf0f1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box' as const
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a085';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ecf0f1';
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#7f8c8d',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  style={{
                    background: '#f8f9fa',
                    border: 'none',
                    color: '#6c757d',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e9ecef';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                  }}
                >
                  <X size={16} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #047857 0%, #065f46 100%)';
                  }}
                >
                  <UserPlus size={16} />
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS para animación de loading */}
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

export default UserManagement;
