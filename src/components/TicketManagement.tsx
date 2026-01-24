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

interface ApiError {
  response?: {
    status: number;
    data: {
      success?: boolean;
      message?: string;
      data?: unknown;
    };
  };
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
      console.log('🔄 Cargando tickets...');
      
      // Obtener parámetro de tipo desde URL
      const tipo = searchParams.get('tipo');
      console.log('🎯 Tipo de ticket solicitado desde URL:', tipo);
      
      // Obtener datos del usuario actual
      const userData = localStorage.getItem('currentUser');
      if (!userData) {
        throw new Error('Datos del usuario no encontrados');
      }
      
      const currentUser = JSON.parse(userData);
      console.log('👤 Usuario actual:', currentUser);
      console.log('🔍 Rol del usuario:', currentUser.rol);
      
      // Construir URL y parámetros según especificaciones
      let apiUrl = '';
      const params = new URLSearchParams({
        limit: '100',
        offset: '0'
      });
      
      let descripcionCarga = '';
      
      // Implementar lógica según especificaciones del documento
      if (currentUser.rol === 'administrador') {
        console.log('👑 Usuario administrador - usando endpoint admin/todos');
        
        // Usar endpoint específico para administradores
        apiUrl = '/tickets/admin/todos';
        
        if (tipo === 'alumnos') {
          params.append('ind_alumno', 'S');
          descripcionCarga = 'tickets de alumnos';
          console.log('📚 Filtrando: Solo tickets de alumnos');
        } else if (tipo === 'personal') {
          params.append('ind_alumno', 'N');
          descripcionCarga = 'tickets del personal';
          console.log('👥 Filtrando: Solo tickets del personal');
        } else {
          // Sin filtro específico - todos los tickets del sistema
          descripcionCarga = 'todos los tickets del sistema';
          console.log('🌐 Filtrando: Todos los tickets');
        }
        
      } else if (currentUser.rol === 'personal') {
        console.log('👔 Usuario personal - verificando permisos específicos');
        
        // Usar endpoint para usuarios normales
        apiUrl = '/tickets/mis-tickets';
        
        // Para personal: aplicar filtros según permisos
        const tienePermisosAlumnos = currentUser.tickets_alumnos === 'S';
        const tienePermisosPersonal = currentUser.tickets_personal === 'S';
        
        console.log('🔐 Permisos del personal:');
        console.log('  - tickets_alumnos:', tienePermisosAlumnos ? 'SÍ' : 'NO');
        console.log('  - tickets_personal:', tienePermisosPersonal ? 'SÍ' : 'NO');
        
        if (tipo === 'alumnos' && tienePermisosAlumnos) {
          params.append('ind_alumno', 'S');
          descripcionCarga = 'tickets de alumnos (por permisos)';
          console.log('📚 Filtrando: Tickets de alumnos (autorizado)');
        } else if (tipo === 'personal' && tienePermisosPersonal) {
          params.append('ind_alumno', 'N');
          descripcionCarga = 'tickets del personal (por permisos)';
          console.log('👥 Filtrando: Tickets del personal (autorizado)');
        } else if (!tipo && (tienePermisosAlumnos || tienePermisosPersonal)) {
          // Sin tipo específico: mostrar según permisos
          if (tienePermisosAlumnos && tienePermisosPersonal) {
            descripcionCarga = 'tickets según permisos (alumnos y personal)';
            console.log('🔄 Filtrando: Todos los tickets permitidos');
          } else if (tienePermisosAlumnos) {
            params.append('ind_alumno', 'S');
            descripcionCarga = 'tickets de alumnos (por permisos)';
            console.log('📚 Filtrando: Solo tickets de alumnos permitidos');
          } else if (tienePermisosPersonal) {
            params.append('ind_alumno', 'N');
            descripcionCarga = 'tickets del personal (por permisos)';
            console.log('👥 Filtrando: Solo tickets del personal permitidos');
          }
        } else {
          // Sin permisos específicos o tipo no autorizado: solo tickets propios
          descripcionCarga = 'tickets propios';
          console.log('👤 Filtrando: Solo tickets propios (sin permisos específicos)');
        }
        
      } else {
        // Alumno: solo sus propios tickets
        console.log('🎓 Usuario alumno - solo tickets propios');
        apiUrl = '/tickets/mis-tickets';
        descripcionCarga = 'tickets propios';
        // No agregar parámetros adicionales - la API devuelve solo tickets propios por defecto
      }
        
        const finalUrl = `${apiUrl}?${params.toString()}`;
        console.log('🔍 URL final construida:', finalUrl);
        console.log('📋 Cargando:', descripcionCarga);
        console.log('🎯 Parámetros enviados al backend:', Object.fromEntries(params));
        
        const response = await Api.get(finalUrl);
        console.log('📊 Respuesta completa del backend:', response.data);
        console.log('🔍 Headers de la petición:', response.config?.headers);
        
        // Verificar si el backend devolvió los tickets filtrados correctamente
        if (response.data.data) {
          console.log('📈 Cantidad de tickets devueltos:', response.data.data.length);
          const rolesEncontrados = response.data.data.map((t: any) => t.usuario?.rol).filter(Boolean);
          const rolesUnicos = [...new Set(rolesEncontrados)];
          console.log('👥 Roles de usuarios en los tickets:', rolesUnicos);
          
          // DIAGNÓSTICO: Verificar si el filtrado funcionó
          if (tipo === 'alumnos' && rolesUnicos.length > 0 && !rolesUnicos.includes('alumno')) {
            console.warn('⚠️ PROBLEMA: Se solicitaron tickets de alumnos pero no hay ninguno en la respuesta');
            console.warn('🔍 Roles encontrados:', rolesUnicos);
          } else if (tipo === 'personal' && rolesUnicos.length > 0 && !rolesUnicos.includes('personal')) {
            console.warn('⚠️ PROBLEMA: Se solicitaron tickets de personal pero no hay ninguno en la respuesta');
            console.warn('🔍 Roles encontrados:', rolesUnicos);
          }
          
          // Mostrar diagnóstico en consola
          console.log('🎯 DIAGNÓSTICO DE FILTRADO:');
          console.log(`   • Tipo solicitado: ${tipo || 'ninguno'}`);
          console.log(`   • Parámetros enviados: ${params.toString()}`);
          console.log(`   • Tickets recibidos: ${response.data.data.length}`);
          console.log(`   • Roles en respuesta: ${rolesUnicos.join(', ') || 'ninguno'}`);
        }
        
        // Procesar respuesta según especificaciones
        let ticketsData = [];
        if (response.data.success && Array.isArray(response.data.data)) {
          ticketsData = response.data.data;
          console.log('✅ Tickets obtenidos exitosamente:', ticketsData.length);
          
          if (response.data.filtros) {
            console.log('📋 Información de filtros:', response.data.filtros);
          }
        } else {
          console.warn('⚠️ Respuesta no tiene el formato esperado:', response.data);
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
        // Popup de éxito removido para evitar molestias al usuario
        
    } catch (error: unknown) {
        console.error('Error conectando con la API:', error);
        
        // Manejo de errores según especificaciones
        const apiError = error as ApiError;
        const status = apiError?.response?.status;
        const errorData = apiError?.response?.data;
        
        if (status === 401) {
          console.log('❌ Error 401: Token faltante o expirado');
          showNotificationMessage('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          navigate('/login');
          return;
        } else if (status === 403) {
          console.log('❌ Error 403: Sin permisos suficientes');
          showNotificationMessage('Sin permisos para acceder a estos tickets.', 'error');
          return;
        } else if (status === 404) {
          console.log('❌ Error 404: Endpoint no encontrado');
          showNotificationMessage('Servicio de tickets no disponible temporalmente.', 'error');
          return;
        } else {
          // Otros errores
          const errorMessage = errorData?.message || 'Error al cargar tickets. Verifica tu conexión.';
          console.error('❌ Error de API:', error);
          showNotificationMessage(errorMessage, 'error');
        }
        
        // Si hay error, mostrar lista vacía
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

  // Función para asignar ticket usando la API según especificaciones
  const asignarTicket = useCallback(async (ticketId: number, usuarioId: number) => {
    try {
      console.log(`🎯 Asignando ticket ${ticketId} al usuario ${usuarioId}`);
      
      // Usar PATCH con endpoint específico según especificaciones correctas
      const response = await Api.patch(`/tickets/${ticketId}/asignar`, {
        asignado_a: usuarioId
      });

      if (response.data.success) {
        console.log('✅ Ticket asignado correctamente:', response.data);
        
        // Actualizar el ticket en el estado local
        const usuarioEncontrado = usuariosAsignables.find(u => u.id === usuarioId);
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? { 
                  ...ticket, 
                  usuario_asignado: usuarioEncontrado ? {
                    id: usuarioEncontrado.id,
                    nombre: usuarioEncontrado.nombre,
                    apellido: usuarioEncontrado.apellido,
                    email: usuarioEncontrado.email
                  } : undefined,
                  fecha_actualizacion: new Date().toISOString()
                }
              : ticket
          )
        );
        
        const usuario = usuariosAsignables.find(u => u.id === usuarioId);
        showNotificationMessage(`Ticket asignado a ${usuario?.nombre} ${usuario?.apellido} exitosamente`, 'success');
      } else {
        throw new Error(response.data.message || 'Error asignando el ticket');
      }
    } catch (error: unknown) {
      console.error('❌ Error asignando ticket:', error);
      
      // Manejo de errores según especificaciones
      const apiError = error as ApiError;
      const status = apiError?.response?.status;
      const errorData = apiError?.response?.data;
      
      console.error('📋 Detalles del error:', {
        status,
        message: errorData?.message,
        error: errorData?.error,
        fullError: errorData
      });
      
      if (status === 403) {
        showNotificationMessage('Sin permisos para asignar tickets.', 'error');
      } else if (status === 404) {
        showNotificationMessage('Ticket no encontrado.', 'error');
      } else if (status === 500) {
        // Error interno del servidor - mostrar información detallada
        const serverError = errorData?.error || 'Error interno del servidor';
        showNotificationMessage(`Error del servidor: ${serverError}. Contacta al administrador.`, 'error');
        console.error('🔧 Error de backend detectado:', serverError);
      } else {
        const errorMessage = errorData?.message || 'Error al asignar el ticket';
        showNotificationMessage(errorMessage, 'error');
      }
    }
  }, [usuariosAsignables, showNotificationMessage]);

  // Handler simplificado para asignar usuario desde la interfaz
  const asignarUsuarioTicket = useCallback(async (ticketId: number, usuarioId: number) => {
    if (!usuarioId) {
      showNotificationMessage('Por favor selecciona un usuario válido', 'error');
      return;
    }
    await asignarTicket(ticketId, usuarioId);
  }, [asignarTicket, showNotificationMessage]);

  // Función para cambiar el estado de un ticket según especificaciones
  const cambiarEstadoTicket = useCallback(async (ticketId: number, nuevoEstado: string) => {
    try {
      console.log(`🔄 Cambiando estado del ticket ${ticketId} a: ${nuevoEstado}`);
      
      // Usar PATCH con endpoint específico para estado
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
      
      // Manejo de errores según especificaciones
      const apiError = error as ApiError;
      const status = apiError?.response?.status;
      const errorData = apiError?.response?.data;
      
      if (status === 401) {
        showNotificationMessage('Sesión expirada. Iniciando sesión nuevamente.', 'error');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        navigate('/login');
      } else if (status === 403) {
        showNotificationMessage('Sin permisos para cambiar el estado de este ticket.', 'error');
      } else if (status === 404) {
        showNotificationMessage('Ticket no encontrado.', 'error');
      } else {
        const errorMessage = errorData?.message || 'Error al cambiar el estado del ticket';
        showNotificationMessage(errorMessage, 'error');
      }
    }
  }, [showNotificationMessage, navigate]);

  // Función para filtrar tickets
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
      },
      // Mapear información de asignación del backend al formato esperado por el frontend
      usuario_asignado: (ticket as any).asignado_a ? {
        id: (ticket as any).asignado_a,
        nombre: (ticket as any).asignado_nombre || 'Usuario asignado',
        apellido: '',
        email: ''
      } : undefined
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener información sobre el filtro activo
  const getFilterInfo = () => {
    const tipo = searchParams.get('tipo');
    const userData = localStorage.getItem('currentUser');
    
    if (!userData) return { title: 'Tickets', description: 'Cargando...' };
    
    const currentUser = JSON.parse(userData);
    
    if (currentUser.rol === 'administrador') {
      switch (tipo) {
        case 'alumnos':
          return { 
            title: '📚 Tickets de Alumnos', 
            description: `${tickets.length} tickets encontrados` 
          };
        case 'personal':
          return { 
            title: '👥 Tickets del Personal', 
            description: `${tickets.length} tickets encontrados` 
          };
        default:
          return { 
            title: '🌐 Todos los Tickets', 
            description: `${tickets.length} tickets encontrados` 
          };
      }
    } else if (currentUser.rol === 'personal') {
      const tienePermisosAlumnos = currentUser.tickets_alumnos === 'S';
      const tienePermisosPersonal = currentUser.tickets_personal === 'S';
      
      switch (tipo) {
        case 'alumnos':
          return tienePermisosAlumnos 
            ? { 
                title: '📚 Tickets de Alumnos', 
                description: `${tickets.length} tickets encontrados` 
              }
            : { 
                title: '🚫 Sin Permisos', 
                description: 'Sin permisos para tickets de alumnos - Mostrando tickets propios' 
              };
        case 'personal':
          return tienePermisosPersonal
            ? { 
                title: '👥 Tickets del Personal', 
                description: `${tickets.length} tickets encontrados` 
              }
            : { 
                title: '🚫 Sin Permisos', 
                description: 'Sin permisos para tickets del personal - Mostrando tickets propios' 
              };
        default:
          if (tienePermisosAlumnos && tienePermisosPersonal) {
            return { 
              title: '🔄 Filtro: Todos los Permitidos', 
              description: `Permisos: alumnos + personal (${tickets.length} tickets)` 
            };
          } else if (tienePermisosAlumnos) {
            return { 
              title: '📚 Filtro: Solo Alumnos Permitidos', 
              description: `Permiso: solo alumnos (${tickets.length} tickets)` 
            };
          } else if (tienePermisosPersonal) {
            return { 
              title: '👥 Filtro: Solo Personal Permitido', 
              description: `Permiso: solo personal (${tickets.length} tickets)` 
            };
          } else {
            return { 
              title: '👤 Filtro: Solo Mis Tickets', 
              description: `Sin permisos especiales (${tickets.length} tickets)` 
            };
          }
      }
    } else {
      return { 
        title: '👤 Filtro: Solo Mis Tickets', 
        description: `Rol alumno - solo tickets propios (${tickets.length} tickets)` 
      };
    }
  };

  const navigateToChat = () => {
    navigate('/chat');
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
              onClick={navigateToChat}
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
              {!isMobile && 'Volver al Chat'}
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