import React, { useState, useEffect, useCallback } from 'react';
import Api from './Api';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  LogOut, 
  University,
  Ticket,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  Calendar,
  RefreshCw,
  Eye
} from 'lucide-react';

interface UserType {
  id: number;
  nombre: string;
  apellido: string;
  rol: string;
}

interface TicketType {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  chat_id?: number;
  respuesta_admin?: string;
  admin_respuesta?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

const MyTickets: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
    hasMore: false
  });

  const showNotificationMessage = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const loadTickets = useCallback(async (resetPagination = true) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filterStatus !== 'todos') params.append('estado', filterStatus);
      if (filterCategory !== 'todos') params.append('categoria', filterCategory);
      params.append('limit', pagination.limit.toString());
      params.append('offset', resetPagination ? '0' : pagination.offset.toString());

      const response = await Api.get(`/tickets/mis-tickets?${params.toString()}`);
      
      if (response.data.success) {
        const newTickets = response.data.data.tickets || [];
        const totalCount = response.data.data.total || 0;
        
        if (resetPagination) {
          setTickets(newTickets);
          setPagination(prev => ({
            ...prev,
            offset: 0,
            total: totalCount,
            hasMore: newTickets.length >= prev.limit
          }));
        } else {
          setTickets(prev => [...prev, ...newTickets]);
          setPagination(prev => ({
            ...prev,
            offset: prev.offset + prev.limit,
            total: totalCount,
            hasMore: newTickets.length >= prev.limit
          }));
        }
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
      showNotificationMessage('Error al cargar los tickets', 'error');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [filterStatus, filterCategory, pagination.limit, pagination.offset]);

  const filterTickets = useCallback(() => {
    let filtered = tickets;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm]);

  // Effects
  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        window.location.href = '/login';
        return;
      }
    }

    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    filterTickets();
  }, [filterTickets]);

  const handleRefresh = () => {
    loadTickets(true);
  };

  const loadMore = () => {
    if (!loading && pagination.hasMore) {
      loadTickets(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abierto': return '#e74c3c';
      case 'en_proceso': return '#f39c12';
      case 'resuelto': return '#27ae60';
      case 'cerrado': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return '#e74c3c';
      case 'alta': return '#f39c12';
      case 'media': return '#3498db';
      case 'baja': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'abierto': return <AlertCircle size={16} color="#e74c3c" />;
      case 'en_proceso': return <Clock size={16} color="#f39c12" />;
      case 'resuelto': return <CheckCircle size={16} color="#27ae60" />;
      case 'cerrado': return <XCircle size={16} color="#95a5a6" />;
      default: return <AlertCircle size={16} color="#7f8c8d" />;
    }
  };

  const translateStatus = (status: string) => {
    const translations = {
      'abierto': 'Abierto',
      'en_proceso': 'En Proceso',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado'
    };
    return translations[status as keyof typeof translations] || status;
  };

  const translatePriority = (priority: string) => {
    const translations = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return translations[priority as keyof typeof translations] || priority;
  };

  const translateCategory = (category: string) => {
    const translations = {
      'consulta': 'Consulta General',
      'problema_tecnico': 'Problema Técnico',
      'sugerencia': 'Sugerencia',
      'queja': 'Queja',
      'otro': 'Otro'
    };
    return translations[category as keyof typeof translations] || category;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  if (initialLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f8f9fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={48} style={{ color: '#006A4E', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: '#7f8c8d', fontSize: '16px' }}>
            Cargando tus tickets...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Notificación Toast */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notificationType === 'success' ? '#d4edda' : '#f8d7da',
          color: notificationType === 'success' ? '#155724' : '#721c24',
          padding: '12px 20px',
          borderRadius: '8px',
          border: `1px solid ${notificationType === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notificationMessage}
        </div>
      )}

      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: 'linear-gradient(135deg, #006A4E 0%, #8A9A5B 100%)',
        color: 'white',
        padding: '20px',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <University size={28} style={{ marginRight: '12px' }} />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Mi Panel</h2>
        </div>

        <nav style={{ marginBottom: '40px' }}>
          <div
            onClick={() => navigateTo('/chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '8px',
              background: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <MessageSquare size={20} style={{ marginRight: '12px' }} />
            <span style={{ fontWeight: '500' }}>Chat</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '8px',
              background: 'rgba(255, 255, 255, 0.15)',
              fontWeight: '600'
            }}
          >
            <Ticket size={20} style={{ marginRight: '12px' }} />
            <span>Mis Tickets</span>
          </div>

          {user?.rol === 'administrador' && (
            <>
              <div
                onClick={() => navigateTo('/admin/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginBottom: '8px',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Settings size={20} style={{ marginRight: '12px' }} />
                <span style={{ fontWeight: '500' }}>Dashboard Admin</span>
              </div>

              <div
                onClick={() => navigateTo('/admin/users')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginBottom: '8px',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Users size={20} style={{ marginRight: '12px' }} />
                <span style={{ fontWeight: '500' }}>Usuarios</span>
              </div>

              <div
                onClick={() => navigateTo('/admin/tickets')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginBottom: '8px',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Ticket size={20} style={{ marginRight: '12px' }} />
                <span style={{ fontWeight: '500' }}>Gestión Tickets</span>
              </div>
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ 
            padding: '16px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '12px', 
            marginBottom: '16px' 
          }}>
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>Conectado como:</div>
            <div style={{ fontWeight: '600' }}>
              {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
              {user?.rol === 'administrador' ? 'Administrador' : 'Usuario'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'rgba(231, 76, 60, 0.2)',
              color: 'white',
              border: '1px solid rgba(231, 76, 60, 0.3)',
              padding: '12px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(231, 76, 60, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(231, 76, 60, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(231, 76, 60, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(231, 76, 60, 0.3)';
            }}
          >
            <LogOut size={16} style={{ marginRight: '8px' }} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: '#f8f9fa' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '24px 32px',
          borderBottom: '1px solid #dee2e6',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#2c3e50',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Ticket size={32} style={{ marginRight: '12px', color: '#006A4E' }} />
                Mis Tickets
              </h1>
              <p style={{ margin: '8px 0 0 0', color: '#7f8c8d', fontSize: '16px' }}>
                Consulta el estado y progreso de tus solicitudes de soporte
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={handleRefresh}
                disabled={loading}
                style={{
                  background: loading ? '#95a5a6' : '#006A4E',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
              <div style={{ 
                background: '#006A4E', 
                color: 'white', 
                padding: '12px 20px', 
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Total: {pagination.total} tickets
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {/* Lista de Tickets */}
          <div style={{ width: selectedTicket ? '60%' : '100%', padding: '24px' }}>
            {/* Filtros y Busqueda */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Buscar tickets
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#7f8c8d' 
                    }} />
                    <input
                      type="text"
                      placeholder="Buscar por título o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 44px',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#006A4E'}
                      onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Estado
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      loadTickets(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      color: '#333'
                    }}
                  >
                    <option value="todos">Todos</option>
                    <option value="abierto">Abierto</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Categoría
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      loadTickets(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      color: '#333'
                    }}
                  >
                    <option value="todos">Todas</option>
                    <option value="consulta">Consulta General</option>
                    <option value="problema_tecnico">Problema Técnico</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="queja">Queja</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de Tickets */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}>
              {filteredTickets.length === 0 ? (
                <div style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: '#7f8c8d'
                }}>
                  <Ticket size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <h3 style={{ margin: '0 0 8px 0', color: '#95a5a6' }}>No hay tickets</h3>
                  <p style={{ margin: 0 }}>
                    {searchTerm || filterStatus !== 'todos' || filterCategory !== 'todos'
                      ? 'No se encontraron tickets que coincidan con los filtros seleccionados.'
                      : 'Aún no has creado ningún ticket de soporte. Ve al chat para crear tu primer ticket.'}
                  </p>
                </div>
              ) : (
                <>
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      style={{
                        padding: '20px',
                        borderBottom: '1px solid #f1f3f4',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: selectedTicket?.id === ticket.id ? '#f8f9ff' : 'white'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTicket?.id !== ticket.id) {
                          e.currentTarget.style.background = '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTicket?.id !== ticket.id) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            margin: '0 0 8px 0', 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: '#2c3e50' 
                          }}>
                            #{ticket.id} - {ticket.titulo}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={14} color="#7f8c8d" />
                              <span style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                {formatDate(ticket.fecha_creacion)}
                              </span>
                            </div>
                            {ticket.respuesta_admin && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MessageSquare size={14} color="#27ae60" />
                                <span style={{ fontSize: '12px', color: '#27ae60', fontWeight: '500' }}>
                                  Respondido
                                </span>
                              </div>
                            )}
                          </div>
                          <p style={{ 
                            margin: 0, 
                            fontSize: '14px', 
                            color: '#7f8c8d', 
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {ticket.descripcion}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getStatusIcon(ticket.estado)}
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: '600',
                              color: getStatusColor(ticket.estado)
                            }}>
                              {translateStatus(ticket.estado)}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '8px'
                          }}>
                            <span style={{
                              padding: '4px 8px',
                              background: getPriorityColor(ticket.prioridad),
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: '600',
                              borderRadius: '4px',
                              textTransform: 'uppercase'
                            }}>
                              {translatePriority(ticket.prioridad)}
                            </span>
                            <span style={{
                              padding: '4px 8px',
                              background: '#e9ecef',
                              color: '#495057',
                              fontSize: '11px',
                              fontWeight: '500',
                              borderRadius: '4px'
                            }}>
                              {translateCategory(ticket.categoria)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Botón para cargar más */}
                  {pagination.hasMore && (
                    <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #f1f3f4' }}>
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        style={{
                          background: loading ? '#95a5a6' : '#006A4E',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          margin: '0 auto'
                        }}
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            Cargando...
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            Cargar más tickets
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Panel de Detalles del Ticket */}
          {selectedTicket && (
            <div style={{
              width: '40%',
              padding: '24px',
              borderLeft: '1px solid #dee2e6',
              background: '#f8f9fa'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                height: 'fit-content'
              }}>
                {/* Header del ticket */}
                <div style={{
                  background: 'linear-gradient(135deg, #006A4E 0%, #8A9A5B 100%)',
                  color: 'white',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                      Ticket #{selectedTicket.id}
                    </h2>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ArrowLeft size={16} />
                    </button>
                  </div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '500', lineHeight: '1.4' }}>
                    {selectedTicket.titulo}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getStatusIcon(selectedTicket.estado)}
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {translateStatus(selectedTicket.estado)}
                      </span>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {translatePriority(selectedTicket.prioridad)}
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {translateCategory(selectedTicket.categoria)}
                    </div>
                  </div>
                </div>

                {/* Contenido del ticket */}
                <div style={{ padding: '20px' }}>
                  {/* Fechas */}
                  <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f3f4' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#495057' }}>
                      Fechas
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} color="#7f8c8d" />
                        <span style={{ fontSize: '13px', color: '#7f8c8d' }}>Creado:</span>
                        <span style={{ fontSize: '13px', color: '#2c3e50' }}>
                          {formatDate(selectedTicket.fecha_creacion)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} color="#7f8c8d" />
                        <span style={{ fontSize: '13px', color: '#7f8c8d' }}>Actualizado:</span>
                        <span style={{ fontSize: '13px', color: '#2c3e50' }}>
                          {formatDate(selectedTicket.fecha_actualizacion)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f3f4' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#495057' }}>
                      Descripción
                    </h4>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px', 
                      color: '#2c3e50', 
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {selectedTicket.descripcion}
                    </p>
                  </div>

                  {/* Respuesta del Admin */}
                  {selectedTicket.respuesta_admin && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#495057' }}>
                        Respuesta del Administrador
                      </h4>
                      <div style={{
                        background: '#e8f5e8',
                        border: '1px solid #d4edda',
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        <p style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '14px', 
                          color: '#2c3e50', 
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {selectedTicket.respuesta_admin}
                        </p>
                        {selectedTicket.admin_respuesta && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#7f8c8d',
                            borderTop: '1px solid #d4edda',
                            paddingTop: '8px'
                          }}>
                            Respondido por: {selectedTicket.admin_respuesta.nombre} {selectedTicket.admin_respuesta.apellido}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Estado actual */}
                  <div style={{
                    background: selectedTicket.estado === 'resuelto' ? '#e8f5e8' : '#fff3cd',
                    border: `1px solid ${selectedTicket.estado === 'resuelto' ? '#d4edda' : '#ffeaa7'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {getStatusIcon(selectedTicket.estado)}
                      <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                        {translateStatus(selectedTicket.estado)}
                      </span>
                    </div>
                    <p style={{ 
                      margin: '8px 0 0 0', 
                      fontSize: '12px', 
                      color: '#7f8c8d',
                      fontStyle: 'italic'
                    }}>
                      {selectedTicket.estado === 'resuelto' 
                        ? 'Tu ticket ha sido resuelto. Si necesitas más ayuda, puedes crear un nuevo ticket.'
                        : selectedTicket.estado === 'en_proceso'
                        ? 'Tu ticket está siendo procesado por nuestro equipo de soporte.'
                        : selectedTicket.estado === 'cerrado'
                        ? 'Este ticket ha sido cerrado.'
                        : 'Tu ticket ha sido recibido y será procesado pronto.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default MyTickets;