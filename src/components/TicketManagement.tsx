import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  User,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface UserType {
  id: number;
  nombre: string;
  apellido: string;
  rol: string;
  activo?: boolean;
  email?: string;
  numero_identificacion?: string;
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
    username?: string;  // Campo que viene del backend
    email?: string;     // Campo que viene del backend
  };
  usuario_asignado?: {  // Nuevo campo para usuario asignado
    id: number;
    nombre: string;
    apellido: string;
    username?: string;
    email?: string;
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
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
  const [usuariosAsignables, setUsuariosAsignables] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPriority, setFilterPriority] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todos');
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
      
      // Obtener parámetro de tipo desde URL
      const tipo = searchParams.get('tipo');
      console.log('🎯 Tipo de ticket solicitado:', tipo);
      
      // Debug: Verificar token y datos del usuario
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('currentUser');
      console.log('🔑 Token disponible:', !!token);
      console.log('👤 Datos del usuario:', userData ? JSON.parse(userData) : 'No disponible');
      
      // Intentar cargar desde la API, si falla usar datos de prueba
      try {
        let apiUrl = '';
        let descripcionCarga = '';
        
        // Determinar la URL de la API según el tipo
        if (tipo === 'alumnos') {
          apiUrl = '/tickets/mis-tickets?all=true&ind_alumno=S&limit=100&offset=0';
          descripcionCarga = 'tickets de alumnos';
        } else if (tipo === 'personal') {
          apiUrl = '/tickets/mis-tickets?all=true&ind_alumno=N&limit=100&offset=0';
          descripcionCarga = 'tickets del personal';
        } else {
          // Sin parámetro o tipo diferente: cargar todos los tickets
          apiUrl = '/tickets/mis-tickets?all=true&limit=100&offset=0';
          descripcionCarga = 'todos los tickets';
        }
        
        console.log('🔍 URL de API a utilizar:', apiUrl);
        console.log('📋 Cargando:', descripcionCarga);
        console.log('🔍 URL completa que se generará: http://localhost:3000/api' + apiUrl);
        
        const response = await Api.get(apiUrl);
        console.log('🔍 Cargando', descripcionCarga, '(vista admin)');
        console.log('📊 Respuesta completa:', response.data);
        console.log('🎫 Número de tickets recibidos:', response.data?.data?.length || 'N/A');
        
        let ticketsData = [];
        // Manejar la respuesta basándose en el formato de MyTickets
        if (response.data.success && response.data.data) {
          if (response.data.data.tickets) {
            ticketsData = response.data.data.tickets;
          } else if (Array.isArray(response.data.data)) {
            ticketsData = response.data.data;
          }
        } else if (response.data.tickets) {
          ticketsData = response.data.tickets;
        } else if (Array.isArray(response.data.data)) {
          ticketsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          ticketsData = response.data;
        }
        
        console.log('📋 Tickets procesados:', ticketsData);
        console.log('👤 Total de tickets recibidos:', ticketsData.length);
        if (ticketsData.length > 0) {
          console.log('🔍 Estructura del primer ticket:', JSON.stringify(ticketsData[0], null, 2));
          console.log('👤 DATOS DE USUARIO del primer ticket:', ticketsData[0]?.usuario);
          if (ticketsData[0]?.usuario) {
            console.log('✅ Usuario procesado - Username:', ticketsData[0].usuario.username, 'Email:', ticketsData[0].usuario.email);
          }
        }
        const validatedTickets = validateTicketData(ticketsData);
        setTickets(validatedTickets);
        if (!isInitial) {
          showNotificationMessage(`Se cargaron ${ticketsData.length} tickets correctamente`, 'success');
        }
      } catch (error: unknown) {
        console.error('Error conectando con la API:', error);
        
        // Verificar si es un error de autenticación (401)
        const errorString = String(error);
        if (errorString.includes('401') || errorString.includes('TOKEN_MISSING') || errorString.includes('Unauthorized')) {
          console.log('Token de autenticación faltante o expirado, redirigiendo al login');
          showNotificationMessage('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          navigate('/login');
          return;
        }
        
        // Para otros errores, mostrar mensaje genérico
        showNotificationMessage('Error al cargar tickets. Verifica tu conexión.', 'error');
        console.error('Error de API:', error);
        throw error;
        
        // OPCIÓN 2: Usar datos de prueba (comentar el throw de arriba)
        // console.log('Usando datos de prueba mientras se configura la API');
        const demoTickets = [
          {
            id: 1,
            titulo: "Problema con el inicio de sesión",
            descripcion: "No puedo acceder a mi cuenta desde ayer",
            categoria: "tecnico",
            prioridad: "alta",
            estado: "abierto",
            fecha_creacion: "2024-10-09T10:30:00Z",
            fecha_actualizacion: "2024-10-09T10:30:00Z",
            usuario: {
              id: 101,
              nombre: "Juan",
              apellido: "Pérez"
            }
          },
          {
            id: 2,
            titulo: "Consulta sobre documentación",
            descripcion: "¿Dónde puedo encontrar el manual de usuario?",
            categoria: "academico",
            prioridad: "media",
            estado: "en_proceso",
            fecha_creacion: "2024-10-09T09:15:00Z",
            fecha_actualizacion: "2024-10-09T14:20:00Z",
            usuario: {
              id: 102,
              nombre: "María",
              apellido: "González"
            }
          },
          {
            id: 3,
            titulo: "Error en la aplicación móvil",
            descripcion: "La app se cierra inesperadamente al abrir documentos",
            categoria: "tecnico",
            prioridad: "alta",
            estado: "resuelto",
            fecha_creacion: "2024-10-08T16:45:00Z",
            fecha_actualizacion: "2024-10-09T08:30:00Z",
            usuario: {
              id: 103,
              nombre: "Carlos",
              apellido: "Rodríguez"
            },
            respuesta_admin: "Problema resuelto en la versión 2.1.5"
          }
        ];
        
        setTickets(demoTickets);
        if (!isInitial) {
          showNotificationMessage(`Cargados ${demoTickets.length} tickets de demostración`, 'info');
        }
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
  }, [showNotificationMessage, navigate, searchParams]);

  // Función para cargar usuarios asignables (solo personal y administrador)
  const loadUsuariosAsignables = useCallback(async () => {
    try {
      console.log('🧑‍💼 Cargando usuarios asignables (personal y administrador)...');
      const token = localStorage.getItem('authToken');
      const response = await Api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Respuesta completa de usuarios:', response.data);
      
      let usuariosData = [];
      if (response.data.success && response.data.data) {
        usuariosData = response.data.data;
      } else if (Array.isArray(response.data)) {
        usuariosData = response.data;
      }
      
      // Filtrar solo usuarios con rol "personal" o "administrador" y que estén activos
      const usuariosFiltrados = usuariosData.filter((usuario: UserType) => 
        usuario.activo && 
        (usuario.rol === 'personal' || usuario.rol === 'administrador')
      );
      
      console.log('✅ Usuarios asignables filtrados:', usuariosFiltrados);
      console.log('👥 Total usuarios asignables:', usuariosFiltrados.length);
      
      setUsuariosAsignables(usuariosFiltrados);
    } catch (error) {
      console.error('❌ Error cargando usuarios asignables:', error);
      setUsuariosAsignables([]);
    }
  }, []);

  // Función para manejar token expirado
  const manejarTokenExpirado = useCallback(() => {
    console.warn('🔄 Token expirado - limpiando localStorage y redirigiendo...');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    showNotificationMessage('⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
    
    // Redirigir al login después de un breve delay
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }, [showNotificationMessage]);

  // Función para verificar la validez del token
  const verificarToken = useCallback(async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      console.log('🔍 Verificando validez del token...');
      const response = await fetch('/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Verificación de token:', response.status, response.ok ? '✅' : '❌');
      
      if (response.status === 401) {
        // Token expirado o inválido
        manejarTokenExpirado();
        return false;
      }
      
      return response.ok;
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      return false;
    }
  }, [manejarTokenExpirado]);

  // Función para asignar ticket usando la API real
  const asignarTicket = useCallback(async (ticketId: number, usuarioId: number) => {
    try {
      // Validar que usuarioId sea un número positivo
      const assignedUserId = Number(usuarioId);
      if (!assignedUserId || assignedUserId <= 0) {
        throw new Error('ID del usuario debe ser un número positivo');
      }
      
      console.log(`🎯 Asignando ticket ${ticketId} al usuario ${assignedUserId}`);
      
      // Verificar token antes de proceder
      const tokenValido = await verificarToken();
      if (!tokenValido) {
        manejarTokenExpirado();
        throw new Error('Tu sesión ha expirado. Redirigiendo al login...');
      }

      // Usar el token correcto (token en lugar de authToken)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticación no encontrado');
      }
      
      console.log('🔑 Token encontrado y verificado:', token?.substring(0, 10) + '...');
      console.log('👤 Usuario actual:', JSON.stringify(user, null, 2));
      console.log('🔐 Es administrador?:', isAdmin);
      console.log('🌐 URL completa:', `${window.location.origin}/api/tickets/${ticketId}/asignar`);
      console.log('📦 Payload:', { asignado_a: assignedUserId });
      
      // Decodificar token para ver qué contiene
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔍 Contenido del token:', payload);
          console.log('🎭 Rol en token:', payload.rol || payload.role || 'No encontrado');
        }
      } catch (e) {
        console.log('❌ No se pudo decodificar el token');
      }
      
      // Usar fetch directo como en el ejemplo
      const response = await fetch(`/api/tickets/${ticketId}/asignar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asignado_a: assignedUserId
        })
      });

      console.log('📡 Status de respuesta:', response.status, response.statusText);
      console.log('📋 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData;
        let errorMessage = response.statusText;
        
        try {
          errorData = await response.json();
          console.error('❌ Respuesta de error completa:', JSON.stringify(errorData, null, 2));
          
          // Verificar si es token expirado
          if (response.status === 401 && 
              (errorData?.error?.details === 'TOKEN_EXPIRED' || 
               errorData?.message?.includes('Token expirado'))) {
            manejarTokenExpirado();
            throw new Error('Tu sesión ha expirado. Redirigiendo al login...');
          }
          
          // Verificar permisos de administrador
          if (response.status === 403 || errorData?.message?.includes('Solo los administradores')) {
            throw new Error('⚠️ No tienes permisos de administrador para asignar tickets');
          }
          
          errorMessage = errorData?.error?.message || errorData?.message || response.statusText;
        } catch (jsonError) {
          // Si no se puede parsear como JSON, intentar como texto
          try {
            const clonedResponse = response.clone();
            const errorText = await clonedResponse.text();
            console.error('❌ Respuesta de error (texto):', errorText);
            errorMessage = errorText || response.statusText;
          } catch (textError) {
            console.error('❌ No se pudo leer el error:', textError);
            errorMessage = response.statusText;
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${errorMessage}`);
      }

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ Ticket asignado exitosamente:', result.data);
        
        // Actualizar el ticket en el estado local
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? { 
                  ...ticket, 
                  usuario_asignado: usuariosAsignables.find(u => u.id === assignedUserId),
                  fecha_actualizacion: new Date().toISOString() 
                }
              : ticket
          )
        );
        
        const usuario = usuariosAsignables.find(u => u.id === assignedUserId);
        showNotificationMessage(`✅ Ticket asignado a ${usuario?.nombre} ${usuario?.apellido} exitosamente`, 'success');
        
        return result.data;
      } else {
        console.error('❌ Error asignando ticket:', result.message);
        throw new Error(result.message || 'Error desconocido del servidor');
      }
    } catch (error: unknown) {
      console.error('❌ Error de conexión o asignación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showNotificationMessage(`Error: ${errorMessage}`, 'error');
      throw error;
    }
  }, [usuariosAsignables, showNotificationMessage, manejarTokenExpirado, verificarToken, isAdmin, user]);

  // Handler para asignar usuario desde el select en la tabla
  const asignarUsuarioTicket = useCallback(async (ticketId: number, usuarioId: number) => {
    try {
      console.log('🔍 DEBUG - Información del usuario actual:', { user, isAdmin });
      console.log('🔍 DEBUG - Intentando asignar ticket:', { ticketId, usuarioId });
      
      // Si usuarioId es 0 o vacío, significa "Sin asignar"
      if (!usuarioId) {
        console.log(`🔄 Desasignando ticket ${ticketId}`);
        showNotificationMessage('Función de desasignación no implementada aún', 'info');
        return;
      }

      // Verificar permisos antes de hacer la llamada
      if (!isAdmin) {
        console.error('❌ Usuario no es administrador, no puede asignar tickets');
        showNotificationMessage('Solo los administradores pueden asignar tickets', 'error');
        return;
      }

      await asignarTicket(ticketId, usuarioId);
      
      // Actualizar estado local tras asignación exitosa
      const usuarioAsignado = usuariosAsignables.find((u: UserType) => u.id === usuarioId);
      
      setTickets((prevTickets: TicketType[]) => prevTickets.map((ticket: TicketType) =>
        ticket.id === ticketId
          ? { ...ticket, usuario_asignado: usuarioAsignado }
          : ticket
      ));
      setFilteredTickets((prevTickets: TicketType[]) => prevTickets.map((ticket: TicketType) =>
        ticket.id === ticketId
          ? { ...ticket, usuario_asignado: usuarioAsignado }
          : ticket
      ));
    } catch (error) {
      console.error('❌ Error en asignarUsuarioTicket:', error);
      
      // Capturar específicamente el error de permisos
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message === 'Solo los administradores pueden asignar tickets') {
          showNotificationMessage('No tienes permisos para asignar tickets. Solo los administradores pueden hacerlo.', 'error');
          return;
        }
      }
      
      showNotificationMessage('Error al asignar el ticket', 'error');
    }
  }, [asignarTicket, usuariosAsignables, showNotificationMessage, user, isAdmin]);

  const filterTickets = useCallback(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${ticket.usuario?.nombre || ''} ${ticket.usuario?.apellido || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
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
        console.log('🔍 DEBUG - Datos del usuario parseados:', parsedUser);
        console.log('🔍 DEBUG - Rol detectado:', parsedUser.rol);
        
        setUser(parsedUser);
        
        // Verificar si es administrador
        const userIsAdmin = parsedUser.rol === 'administrador';
        setIsAdmin(userIsAdmin);
        
        console.log('🔍 DEBUG - ¿Es administrador?:', userIsAdmin);
        
        // Temporal: Permitir acceso a todos los usuarios para debugging
        if (!userIsAdmin) {
          console.log('⚠️ Usuario no es administrador, rol:', parsedUser.rol);
          console.log('� DEBUG: Permitiendo acceso pero sin funciones de admin');
          // navigate('/chat');  // Comentado temporalmente
          // return;
        }
        
        console.log('✅ Usuario es administrador, cargando datos...');
        
        // Cargar tickets y usuarios asignables
        loadTickets(true);
        
        // Solo cargar usuarios asignables si es administrador
        if (userIsAdmin) {
          loadUsuariosAsignables();
        }
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        navigate('/login');
        return;
      }
    }
  }, [loadTickets, loadUsuariosAsignables, navigate, searchParams]);

  useEffect(() => {
    filterTickets();
  }, [filterTickets]);

  // Función para validar y limpiar los datos de tickets
  const validateTicketData = (tickets: TicketType[]): TicketType[] => {
    return tickets.map(ticket => ({
      ...ticket,
      titulo: ticket.titulo || 'Título no disponible',
      descripcion: ticket.descripcion || 'Descripción no disponible',
      categoria: ticket.categoria || 'otro',
      prioridad: ticket.prioridad || 'media',
      estado: ticket.estado || 'abierto',
      fecha_creacion: ticket.fecha_creacion || new Date().toISOString(),
      fecha_actualizacion: ticket.fecha_actualizacion || new Date().toISOString(),
      usuario: {
        id: ticket.usuario?.id || 0,
        // Adaptar a los campos que realmente vienen del backend
        nombre: ticket.usuario?.username || ticket.usuario?.nombre || 'Usuario',
        apellido: ticket.usuario?.email || ticket.usuario?.apellido || 'Sin email'
      }
    }));
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

  // Función para cambiar el estado de un ticket
  const cambiarEstadoTicket = useCallback(async (ticketId: number, nuevoEstado: string) => {
    try {
      console.log(`🔄 Cambiando estado del ticket ${ticketId} a: ${nuevoEstado}`);
      
      const response = await Api.patch(`/tickets/${ticketId}/estado`, {
        estado: nuevoEstado
      });

      if (response.data.success) {
        console.log('✅ Estado actualizado correctamente:', response.data);
        
        // Actualizar el ticket en el estado local
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? { ...ticket, estado: nuevoEstado, fecha_actualizacion: new Date().toISOString() }
              : ticket
          )
        );
        
        showNotificationMessage(`Estado cambiado a "${nuevoEstado}" exitosamente`, 'success');
      } else {
        throw new Error(response.data.message || 'Error actualizando el ticket');
      }
    } catch (error: unknown) {
      console.error('❌ Error cambiando estado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showNotificationMessage(`Error: ${errorMessage}`, 'error');
    }
  }, [showNotificationMessage]);



  const stats = {
    total: tickets.length,
    abiertos: tickets.filter(t => t.estado === 'abierto').length,
    enProceso: tickets.filter(t => t.estado === 'en_proceso').length,
    resueltos: tickets.filter(t => t.estado === 'resuelto').length,
    asignados: tickets.filter(t => t.usuario_asignado).length,
    sinAsignar: tickets.filter(t => !t.usuario_asignado).length
  };

  if (initialLoading) {
    return (
      <div style={{ 
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #047857 0%, #065f46 25%, #064e3b 50%, #0f172a 100%)',
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
          <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px', color: '#047857' }} />
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
      background: 'linear-gradient(135deg, #047857 0%, #065f46 25%, #064e3b 50%, #0f172a 100%)',
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
                color: '#047857',
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
                background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
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
                  background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
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
                {/* DEBUG: Mostrar información del usuario */}
                <p style={{ 
                  margin: '4px 0 0 0', 
                  color: isAdmin ? '#27ae60' : '#e74c3c', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Usuario: {user?.nombre} | Rol: {user?.rol} | Admin: {isAdmin ? 'Sí' : 'No'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => loadTickets(false)}
              disabled={loading}
              style={{
                background: loading ? 'rgba(4, 120, 87, 0.5)' : 'rgba(4, 120, 87, 0.1)',
                border: 'none',
                color: '#047857',
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
                <BarChart3 size={20} color="#047857" />
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
              gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr 1fr',
              gap: isMobile ? '16px' : '20px',
              alignItems: 'end'
            }}>
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Buscar tickets
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por título, descripción o usuario..."
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      padding: '12px 12px 12px 44px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#ffffff',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
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
                    color: '#000000',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {estadoOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ color: '#000000', background: '#ffffff' }}>
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
                    color: '#000000',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {prioridadOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ color: '#000000', background: '#ffffff' }}>
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
                    color: '#000000',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {categoriaOptions.map(option => (
                    <option key={option.value} value={option.value} style={{ color: '#000000', background: '#ffffff' }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Nota informativa sobre asignación */}
          {isAdmin && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <CheckCircle size={20} color="#22c55e" />
              <div style={{ fontSize: '14px', color: '#15803d', flex: 1 }}>
                <strong>Asignación de Tickets:</strong> Puedes asignar tickets a usuarios con rol "personal" o "administrador". 
                Los cambios se guardarán en el sistema.
              </div>
            </div>
          )}

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
                          <select
                            value={ticket.estado}
                            onChange={(e) => cambiarEstadoTicket(ticket.id, e.target.value)}
                            style={{
                              background: getStatusColor(ticket.estado),
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              outline: 'none',
                              marginLeft: '8px',
                              flexShrink: 0,
                              minWidth: '100px'
                            }}
                          >
                            {estadoOptions.filter(option => option.value !== 'todos').map(option => (
                              <option 
                                key={option.value} 
                                value={option.value}
                                style={{ 
                                  color: '#000000', 
                                  background: '#ffffff',
                                  padding: '4px'
                                }}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={14} color="#64748b" />
                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                              {ticket.usuario?.nombre || 'Usuario'} {ticket.usuario?.apellido || 'Desconocido'}
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

                        {isAdmin && (
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>
                              Asignar a:
                            </label>
                            <select
                              value={ticket.usuario_asignado?.id || ''}
                              onChange={(e) => {
                                const userId = Number(e.target.value);
                                asignarUsuarioTicket(ticket.id, userId);
                              }}
                              style={{
                                background: '#f3f4f6',
                                color: '#1e293b',
                                border: '1px solid #e2e8f0',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                outline: 'none',
                                width: '100%'
                              }}
                            >
                              <option value="">Sin asignar</option>
                              {usuariosAsignables.map(usuario => (
                                <option key={usuario.id} value={usuario.id}>
                                  {usuario.nombre} {usuario.apellido} ({usuario.rol})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

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
                          {isAdmin && (
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                              Asignado a
                            </th>
                          )}
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                            Prioridad
                          </th>
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                            Categoría
                          </th>
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                            Fecha
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map(ticket => (
                            <tr
                              key={ticket.id}
                              style={{
                                borderBottom: '1px solid #e2e8f0',
                                transition: 'all 0.3s ease'
                              }}
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
                                    background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
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
                                    {(ticket.usuario?.nombre || 'U').charAt(0)}{(ticket.usuario?.apellido || 'N').charAt(0)}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                                      {ticket.usuario?.nombre || 'Usuario'} {ticket.usuario?.apellido || 'Desconocido'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px 24px' }}>
                                <select
                                  value={ticket.estado}
                                  onChange={(e) => cambiarEstadoTicket(ticket.id, e.target.value)}
                                  style={{
                                    background: getStatusColor(ticket.estado),
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    minWidth: '120px'
                                  }}
                                >
                                  {estadoOptions.filter(option => option.value !== 'todos').map(option => (
                                    <option 
                                      key={option.value} 
                                      value={option.value}
                                      style={{ 
                                        color: '#000000', 
                                        background: '#ffffff',
                                        padding: '4px'
                                      }}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              {isAdmin && (
                                <td style={{ padding: '16px 24px' }}>
                                  <select
                                    value={ticket.usuario_asignado?.id || ''}
                                    onChange={(e) => {
                                      const userId = Number(e.target.value);
                                      asignarUsuarioTicket(ticket.id, userId);
                                    }}
                                    style={{
                                      background: '#f3f4f6',
                                      color: '#1e293b',
                                      border: '1px solid #e2e8f0',
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      outline: 'none',
                                      minWidth: '120px'
                                    }}
                                  >
                                    <option value="">Sin asignar</option>
                                    {usuariosAsignables.map(usuario => (
                                      <option key={usuario.id} value={usuario.id}>
                                        {usuario.nombre} {usuario.apellido} ({usuario.rol})
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              )}
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