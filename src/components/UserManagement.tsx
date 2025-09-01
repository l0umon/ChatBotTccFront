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
  LogOut,
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
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    numero_identificacion: '',
    rol: 'alumno',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

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
    background: 'linear-gradient(135deg, #f8fdfa 0%, #ecf9f5 100%)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    overflow: 'hidden'
  };

  const sidebarStyle = {
    width: '280px',
    background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
  };

  const mainContentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
    color: '#ffffff',
    padding: '20px 30px',
    boxShadow: '0 4px 20px rgba(22, 160, 133, 0.3)'
  };

  const contentStyle = {
    flex: 1,
    padding: '30px',
    overflowY: 'auto' as const,
    background: 'linear-gradient(135deg, #f8fdfa 0%, #ecf9f5 100%)'
  };

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        {/* Logo */}
        <div style={{ 
          padding: '30px 20px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(22, 160, 133, 0.2)',
            borderRadius: '12px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={24} color="#16a085" />
          </div>
          <span style={{ fontWeight: '700', fontSize: '18px' }}>ChatBot Universitario</span>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '20px' }}>
          <div style={{ marginBottom: '30px' }}>
            <span style={{ 
              color: '#bdc3c7', 
              fontSize: '12px', 
              fontWeight: '600', 
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '15px',
              display: 'block'
            }}>
              Navegación
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#bdc3c7',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  textAlign: 'left' as const
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#bdc3c7';
                }}
              >
                <BarChart3 size={18} />
                Dashboard
              </button>

              <button
                style={{
                  background: 'linear-gradient(135deg, rgba(22, 160, 133, 0.2) 0%, rgba(19, 141, 117, 0.1) 100%)',
                  border: '1px solid rgba(22, 160, 133, 0.3)',
                  color: '#16a085',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  textAlign: 'left' as const
                }}
              >
                <Users size={18} />
                Gestión de Usuarios
                <span style={{
                  background: '#16a085',
                  color: '#ffffff',
                  borderRadius: '20px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginLeft: 'auto'
                }}>
                  {users.length}
                </span>
              </button>

              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#bdc3c7',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  textAlign: 'left' as const
                }}
                onClick={() => window.close()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#bdc3c7';
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
          padding: '20px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>Administrador</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Admin</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(231, 76, 60, 0.2)',
              border: 'none',
              color: '#e74c3c',
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
              e.currentTarget.style.background = 'rgba(231, 76, 60, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(231, 76, 60, 0.2)';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
                Gestión de Usuarios
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>
                Administra y controla los usuarios del sistema
              </p>
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
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
              <UserPlus size={16} />
              Registrar Usuario
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Search and Filters */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            padding: '30px', 
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            {/* Search */}
            <div style={{ 
              position: 'relative',
              marginBottom: '25px'
            }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '15px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#7f8c8d'
                }} 
              />
              <input
                type="text"
                placeholder="Buscar usuarios por nombre, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 15px 15px 50px',
                  border: '2px solid #ecf0f1',
                  borderRadius: '12px',
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

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', icon: Users, label: 'Todos' },
                { key: 'alumno', icon: UserGraduate, label: 'Estudiantes' },
                { key: 'personal', icon: UserCheck, label: 'Personal' },
                { key: 'administrador', icon: Shield, label: 'Administradores' },
                { key: 'blocked', icon: UserSlash, label: 'Bloqueados' }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  style={{
                    background: activeFilter === key 
                      ? 'linear-gradient(135deg, #16a085 0%, #138d75 100%)' 
                      : '#f8f9fa',
                    color: activeFilter === key ? '#ffffff' : '#2c3e50',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (activeFilter !== key) {
                      e.currentTarget.style.background = '#e9ecef';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilter !== key) {
                      e.currentTarget.style.background = '#f8f9fa';
                    }
                  }}
                >
                  <Icon size={16} />
                  {label}
                  <span style={{
                    background: activeFilter === key 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : '#16a085',
                    color: activeFilter === key ? '#ffffff' : '#ffffff',
                    borderRadius: '20px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    minWidth: '20px',
                    textAlign: 'center' as const
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
                <Users size={20} color="#16a085" />
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
              <div style={{ overflowX: 'auto' as const }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse' as const 
                }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ 
                        padding: '15px 20px', 
                        textAlign: 'left' as const, 
                        fontWeight: '600',
                        color: '#2c3e50',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserCheck size={16} />
                          Usuario
                        </div>
                      </th>
                      <th style={{ 
                        padding: '15px 20px', 
                        textAlign: 'left' as const, 
                        fontWeight: '600',
                        color: '#2c3e50',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={16} />
                          Email
                        </div>
                      </th>
                      <th style={{ 
                        padding: '15px 20px', 
                        textAlign: 'left' as const, 
                        fontWeight: '600',
                        color: '#2c3e50',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <IdCard size={16} />
                          Identificación
                        </div>
                      </th>
                      <th style={{ 
                        padding: '15px 20px', 
                        textAlign: 'left' as const, 
                        fontWeight: '600',
                        color: '#2c3e50',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserTag size={16} />
                          Rol
                        </div>
                      </th>
                      <th style={{ 
                        padding: '15px 20px', 
                        textAlign: 'left' as const, 
                        fontWeight: '600',
                        color: '#2c3e50',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={16} />
                          Estado
                        </div>
                      </th>
                      <th style={{ 
                        padding: '15px 20px', 
                        textAlign: 'left' as const, 
                        fontWeight: '600',
                        color: '#2c3e50',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Settings size={16} />
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
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontWeight: '600',
                              fontSize: '14px'
                            }}>
                              {user.nombre.charAt(0) + user.apellido.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                                {user.nombre} {user.apellido}
                              </div>
                              <div style={{ color: '#7f8c8d', fontSize: '12px' }}>
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '20px', color: '#2c3e50', fontSize: '14px' }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '20px', color: '#2c3e50', fontSize: '14px' }}>
                          {user.numero_identificacion || 'N/A'}
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: user.rol === 'administrador' 
                              ? '#e8f5e8' 
                              : user.rol === 'personal' 
                              ? '#fff3cd' 
                              : '#e3f2fd',
                            color: user.rol === 'administrador' 
                              ? '#2e7d32' 
                              : user.rol === 'personal' 
                              ? '#8a6d3b' 
                              : '#1976d2'
                          }}>
                            {user.rol === 'administrador' ? 'Admin' : 
                             user.rol === 'personal' ? 'Personal' : 'Estudiante'}
                          </span>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: user.activo ? '#e8f5e8' : '#ffebee',
                            color: user.activo ? '#2e7d32' : '#c62828'
                          }}>
                            {user.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEditUser(user)}
                              style={{
                                background: '#e3f2fd',
                                border: 'none',
                                color: '#1976d2',
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
                                e.currentTarget.style.background = '#bbdefb';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#e3f2fd';
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user.id, user.activo)}
                              style={{
                                background: user.activo ? '#ffebee' : '#e8f5e8',
                                border: 'none',
                                color: user.activo ? '#c62828' : '#2e7d32',
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
                                e.currentTarget.style.background = user.activo ? '#ffcdd2' : '#c8e6c8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = user.activo ? '#ffebee' : '#e8f5e8';
                              }}
                            >
                              {user.activo ? <UserSlash size={16} /> : <CheckCircle size={16} />}
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
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '500px',
            maxHeight: '90vh',
            overflowY: 'auto' as const,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '25px 30px',
              borderBottom: '1px solid #ecf0f1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit size={20} color="#16a085" />
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
            
            <form onSubmit={handleUpdateUser} style={{ padding: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
                    background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
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
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #16a085 0%, #138d75 100%)';
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
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '500px',
            maxHeight: '90vh',
            overflowY: 'auto' as const,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '25px 30px',
              borderBottom: '1px solid #ecf0f1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={20} color="#16a085" />
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
            
            <form onSubmit={handleCreateUser} style={{ padding: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
                    background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
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
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #16a085 0%, #138d75 100%)';
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
