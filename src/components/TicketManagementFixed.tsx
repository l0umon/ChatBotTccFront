import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from './Api';
import { 
  ArrowLeft, 
  LogOut, 
  Ticket,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  User,
  Calendar,
  Bot,
  BarChart3,
  RefreshCw,
  Eye,
  Send
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
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
  };
  contextoChat?: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  respuesta_admin?: string;
  admin_respuesta?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

const estadoOptions = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'cerrado', label: 'Cerrado' }
];

const prioridadOptions = [
  { value: 'todos', label: 'Todas las prioridades' },
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' }
];

const categoriaOptions = [
  { value: 'todos', label: 'Todas las categorías' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'academico', label: 'Académico' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'otro', label: 'Otro' }
];

const TicketManagement: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPriority, setFilterPriority] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });

  const showNotificationMessage = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadTickets = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }
      console.log('Cargando tickets...');
      const response = await Api.get('/tickets');
      console.log('Respuesta de tickets:', response.data);
      
      let ticketsData = [];
      if (response.data.tickets) {
        ticketsData = response.data.tickets;
      } else if (Array.isArray(response.data.data)) {
        ticketsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        ticketsData = response.data;
      }
      
      console.log('Tickets procesados:', ticketsData);
      setTickets(ticketsData);
      if (!isInitial) {
        showNotificationMessage(`Se cargaron ${ticketsData.length} tickets correctamente`, 'success');
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
      showNotificationMessage('Error al cargar los tickets', 'error');
      setTickets([]);
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [showNotificationMessage]);

  const filterTickets = useCallback(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${ticket.usuario.nombre} ${ticket.usuario.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'todos') {
      filtered = filtered.filter(ticket => ticket.estado === filterStatus);
    }

    if (filterPriority !== 'todos') {
      filtered = filtered.filter(ticket => ticket.prioridad === filterPriority);
    }

    if (filterCategory !== 'todos') {
      filtered = filtered.filter(ticket => ticket.categoria === filterCategory);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, filterStatus, filterPriority, filterCategory]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        if (parsedUser.rol !== 'administrador') {
          navigate('/chat');
          return;
        }
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        navigate('/login');
        return;
      }
    }

    loadTickets(true);
  }, [loadTickets, navigate]);

  useEffect(() => {
    filterTickets();
  }, [filterTickets]);

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      setLoading(true);
      await Api.put(`/tickets/${ticketId}/estado`, { estado: newStatus });
      
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, estado: newStatus } : ticket
      ));
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, estado: newStatus });
      }
      
      showNotificationMessage('Estado del ticket actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      showNotificationMessage('Error al actualizar el estado del ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async () => {
    if (!selectedTicket || !responseText.trim()) return;

    try {
      setLoading(true);
      await Api.post(`/tickets/${selectedTicket.id}/responder`, {
        respuesta: responseText.trim()
      });

      setTickets(prev => prev.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { 
              ...ticket, 
              respuesta_admin: responseText.trim(),
              admin_respuesta: user ? { id: user.id, nombre: user.nombre, apellido: user.apellido } : undefined,
              estado: 'resuelto'
            } 
          : ticket
      ));

      setSelectedTicket({
        ...selectedTicket,
        respuesta_admin: responseText.trim(),
        admin_respuesta: user ? { id: user.id, nombre: user.nombre, apellido: user.apellido } : undefined,
        estado: 'resuelto'
      });

      setResponseText('');
      setShowResponseForm(false);
      showNotificationMessage('Respuesta enviada correctamente', 'success');
    } catch (error) {
      console.error('Error enviando respuesta:', error);
      showNotificationMessage('Error al enviar la respuesta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTicket(null);
    setShowResponseForm(false);
    setResponseText('');
    document.body.style.overflow = 'auto';
  };

  const getStatusColor = (estado: string) => {
    const colors = {
      abierto: '#e74c3c',
      en_proceso: '#f39c12',
      resuelto: '#27ae60',
      cerrado: '#95a5a6'
    };
    return colors[estado as keyof typeof colors] || '#95a5a6';
  };

  const getPriorityColor = (prioridad: string) => {
    const colors = {
      baja: '#95a5a6',
      media: '#3498db',
      alta: '#f39c12',
      critica: '#e74c3c'
    };
    return colors[prioridad as keyof typeof colors] || '#95a5a6';
  };

  const getStatusIcon = (estado: string) => {
    const icons = {
      abierto: <Clock size={16} />,
      en_proceso: <AlertCircle size={16} />,
      resuelto: <CheckCircle size={16} />,
      cerrado: <XCircle size={16} />
    };
    return icons[estado as keyof typeof icons] || <Clock size={16} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const stats = {
    total: tickets.length,
    abiertos: tickets.filter(t => t.estado === 'abierto').length,
    enProceso: tickets.filter(t => t.estado === 'en_proceso').length,
    resueltos: tickets.filter(t => t.estado === 'resuelto').length
  };

  if (initialLoading) {
    return (
      <div style={{ 
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px', color: '#667eea' }} />
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>
            Cargando Gestión de Tickets
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Obteniendo información de tickets...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' ? '#d4edda' : notification.type === 'error' ? '#f8d7da' : '#d1ecf1',
          color: notification.type === 'success' ? '#155724' : notification.type === 'error' ? '#721c24' : '#0c5460',
          padding: '12px 20px',
          borderRadius: '12px',
          border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : notification.type === 'error' ? '#f5c6cb' : '#bee5eb'}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '16px 20px' : '20px 40px',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={navigateToDashboard}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowLeft size={20} />
              {!isMobile && 'Volver al Dashboard'}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ticket size={24} color="white" />
              </div>
              <div>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: isMobile ? '20px' : '28px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Gestión de Tickets
                </h1>
                <p style={{ 
                  margin: 0, 
                  color: '#64748b', 
                  fontSize: '14px',
                  display: isMobile ? 'none' : 'block'
                }}>
                  Administra y responde tickets de soporte
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => loadTickets(false)}
              disabled={loading}
              style={{
                background: loading ? 'rgba(102, 126, 234, 0.5)' : 'rgba(102, 126, 234, 0.1)',
                border: 'none',
                color: '#667eea',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {!isMobile && 'Actualizar'}
            </button>

            <button
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                color: '#ef4444',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <LogOut size={16} />
              {!isMobile && 'Salir'}
            </button>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: isMobile ? '20px' : '40px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <BarChart3 size={20} color="#667eea" />
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Total</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                {stats.total}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Clock size={20} color="#e74c3c" />
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Abiertos</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#e74c3c' }}>
                {stats.abiertos}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <AlertCircle size={20} color="#f39c12" />
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>En Proceso</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f39c12' }}>
                {stats.enProceso}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <CheckCircle size={20} color="#27ae60" />
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Resueltos</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#27ae60' }}>
                {stats.resueltos}
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
              gap: '16px',
              alignItems: 'end'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Buscar tickets
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por título, descripción o usuario..."
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#ffffff',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Estado
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {estadoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Prioridad
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {prioridadOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Categoría
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {categoriaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden'
          }}>
            {loading && (
              <div style={{
                padding: '60px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <p>Cargando tickets...</p>
              </div>
            )}

            {!loading && filteredTickets.length === 0 && (
              <div style={{
                padding: '60px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <Ticket size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                  No se encontraron tickets
                </h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  {searchTerm || filterStatus !== 'todos' || filterPriority !== 'todos' || filterCategory !== 'todos'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay tickets registrados en el sistema'}
                </p>
              </div>
            )}

            {!loading && filteredTickets.length > 0 && (
              <div>
                {isMobile ? (
                  <div style={{ padding: '16px' }}>
                    {filteredTickets.map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => openDetailModal(ticket)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '16px',
                          marginBottom: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b', lineHeight: '1.4' }}>
                            {ticket.titulo}
                          </h4>
                          <div style={{
                            background: getStatusColor(ticket.estado),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginLeft: '8px',
                            flexShrink: 0
                          }}>
                            {getStatusIcon(ticket.estado)}
                            {ticket.estado.replace('_', ' ')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={14} color="#64748b" />
                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                              {ticket.usuario.nombre} {ticket.usuario.apellido}
                            </span>
                          </div>
                          <div style={{
                            background: getPriorityColor(ticket.prioridad),
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}>
                            {ticket.prioridad}
                          </div>
                        </div>

                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                          {ticket.descripcion.length > 100 ? `${ticket.descripcion.substring(0, 100)}...` : ticket.descripcion}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                          <span>{ticket.categoria}</span>
                          <span>{formatDate(ticket.fecha_creacion)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(102, 126, 234, 0.05)' }}>
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                            Ticket
                          </th>
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                            Usuario
                          </th>
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                            Estado
                          </th>
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                            Prioridad
                          </th>
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                            Categoría
                          </th>
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                            Fecha
                          </th>
                          <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map(ticket => (
                          <tr
                            key={ticket.id}
                            style={{
                              borderBottom: '1px solid #e2e8f0',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onClick={() => openDetailModal(ticket)}
                          >
                            <td style={{ padding: '16px 24px' }}>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                                  {ticket.titulo}
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                                  {ticket.descripcion.length > 80 ? `${ticket.descripcion.substring(0, 80)}...` : ticket.descripcion}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}>
                                  {ticket.usuario.nombre.charAt(0)}{ticket.usuario.apellido.charAt(0)}
                                </div>
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                                    {ticket.usuario.nombre} {ticket.usuario.apellido}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{
                                background: getStatusColor(ticket.estado),
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                {getStatusIcon(ticket.estado)}
                                {ticket.estado.replace('_', ' ')}
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{
                                background: getPriorityColor(ticket.prioridad),
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'inline-block'
                              }}>
                                {ticket.prioridad}
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                              {ticket.categoria}
                            </td>
                            <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                              {formatDate(ticket.fecha_creacion)}
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDetailModal(ticket);
                                }}
                                style={{
                                  background: 'rgba(102, 126, 234, 0.1)',
                                  border: 'none',
                                  color: '#667eea',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  transition: 'all 0.3s ease',
                                  margin: '0 auto'
                                }}
                              >
                                <Eye size={14} />
                                Ver
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
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
      `}</style>
    </div>
  );
};

export default TicketManagement;