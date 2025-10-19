import React, { useEffect, useRef, useState, useCallback } from 'react';
import Api from './Api';
import { LogOut, User, Bot, Plus, Users, Settings, FileText, University, Send, Ticket, Bell, X, Clock, CheckCircle, AlertCircle, XCircle, Calendar, RefreshCw, Eye, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface UserType {
  nombre: string;
  apellido: string;
  rol: string;
}

interface ChatType {
  id: number;
  titulo: string;
  fecha_actualizacion?: string;
  fecha_creacion?: string;
}

interface MessageType {
  id: number;
  rol: 'usuario' | 'asistente';
  contenido: string;
  documentos_descargables?: DocumentoDescargable[];
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

interface DocumentoDescargable {
  id: number;
  titulo: string;
  descripcion: string;
  nombre_archivo: string;
  tipo_archivo: string;
  tamaño_archivo: string;
  url_descarga: string;
  fuente_original?: string;
  similitud_fuente?: number;
}

const Chat: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [expandedDocuments, setExpandedDocuments] = useState<Set<number>>(new Set());

  const toggleDocuments = (messageId: number) => {
    setExpandedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const descargarDocumento = async (documentoId: number, nombreArchivo: string, fuenteOriginal?: string) => {
    try {
      console.log(`📥 Descargando documento ${documentoId}...`);
      
      // Si hay fuente original, intentar buscar el documento real por nombre
      if (fuenteOriginal) {
        try {
          console.log(`🔍 Buscando documento por fuente: ${fuenteOriginal}`);
          // Intentar obtener lista de documentos y buscar coincidencia
          const docsResponse = await Api.get('/documents?limit=100&offset=0');
          const documentos = docsResponse.data.documentos || [];
          
          // Buscar documento que coincida con la fuente
          const docEncontrado = documentos.find((doc: Record<string, unknown>) => {
            const tituloLimpio = (doc.titulo as string)?.toLowerCase().replace(/[^a-z0-9]/g, '');
            const fuenteLimpia = fuenteOriginal.toLowerCase().replace(/[^a-z0-9]/g, '');
            return tituloLimpio === fuenteLimpia || 
                   tituloLimpio?.includes(fuenteLimpia.replace(/\d+$/, '')) ||
                   (doc.nombre_archivo as string)?.toLowerCase().includes(fuenteLimpia.replace(/\d+$/, ''));
          });
          
          if (docEncontrado) {
            console.log(`✅ Documento encontrado en BD:`, docEncontrado);
            // Usar el ID real del documento encontrado
            documentoId = docEncontrado.id;
            nombreArchivo = docEncontrado.nombre_archivo || nombreArchivo;
          }
        } catch (searchError) {
          console.log(`⚠️ No se pudo buscar en BD, usando ID original`);
        }
      }
      
      // Probar diferentes endpoints posibles
      let response;
      const endpoints = [
        `/documents/${documentoId}/download`,
        `/documents/download/${documentoId}`,
        `/documentos/${documentoId}/download`,
        `/documentos/download/${documentoId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          response = await Api.get(endpoint, { responseType: 'blob' });
          console.log(`✅ Endpoint funcionando: ${endpoint}`);
          break;
        } catch (endpointError) {
          console.log(`❌ Endpoint ${endpoint} no funciona, probando siguiente...`);
          continue;
        }
      }
      
      if (!response) {
        throw new Error('No se encontró un endpoint válido para la descarga');
      }

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo || `documento_${documentoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Descarga completada: ${nombreArchivo}`);
      
    } catch (error) {
      console.error('❌ Error descargando:', error);
      
      // Fallback: mostrar información del documento en lugar de descargar
      alert(`📄 Documento: ${nombreArchivo}\n\n${fuenteOriginal ? `🔍 Fuente: ${fuenteOriginal}\n` : ''}ID: ${documentoId}\n\n📚 Este documento está disponible en el sistema pero no se pudo descargar automáticamente.\n\n💡 Posibles soluciones:\n• Contacta al administrador del sistema\n• Verifica que tengas permisos de descarga\n• El archivo podría no estar disponible temporalmente\n\n❌ Error técnico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const formatearTamañoArchivo = (bytes: string | number): string => {
    if (!bytes || bytes === '0' || bytes === 0) return 'N/A';
    const bytesNum = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytesNum) / Math.log(1024));
    return Math.round(bytesNum / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const obtenerTipoArchivo = (mimeType: string): string => {
    const tipos: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'text/plain': 'TXT'
    };
    return tipos[mimeType] || 'DOC';
  };
  const [message, setMessage] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para el sistema de tickets
  const [messageCount, setMessageCount] = useState(0);
  const [showTicketButton, setShowTicketButton] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    prioridad: 'media',
    includeContext: true
  });
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string, timestamp: string}>>([]);
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);

  // Estados para el modal de Mis Tickets
  const [showMyTicketsModal, setShowMyTicketsModal] = useState(false);
  const [myTickets, setMyTickets] = useState<TicketType[]>([]);
  const [filteredMyTickets, setFilteredMyTickets] = useState<TicketType[]>([]);
  const [selectedMyTicket, setSelectedMyTicket] = useState<TicketType | null>(null);
  const [myTicketsSearchTerm, setMyTicketsSearchTerm] = useState('');
  const [myTicketsFilterStatus, setMyTicketsFilterStatus] = useState('todos');
  const [myTicketsFilterCategory, setMyTicketsFilterCategory] = useState('todos');
  const [loadingMyTickets, setLoadingMyTickets] = useState(false);
  const [myTicketsPagination, setMyTicketsPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  });

  // Detectar dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // On mount: check auth and load user/chats
  useEffect(() => {
    const token = localStorage.getItem('authToken');  // Cambiado de 'token' a 'authToken'
    const userData = localStorage.getItem('currentUser');
    
    if (!token) {
      console.log('No hay token, redirigiendo al login');
      window.location.href = '/login';
      return;
    }
    
    setAuthToken(token);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Usuario cargado:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        console.log('Datos de usuario raw:', userData);
        // No redirigir al login por error de parsing, usar datos por defecto
        setUser({
          nombre: 'Usuario',
          apellido: '',
          rol: 'alumno'
        });
      }
    } else {
      console.warn('No hay datos de usuario en localStorage, usando valores por defecto');
      // No redirigir al login, usar datos por defecto
      setUser({
        nombre: 'Usuario',
        apellido: '',
        rol: 'alumno'
      });
    }
    
    // Fetch chats inline to avoid dependency issues
    const loadInitialChats = async () => {
      try {
        const res = await Api.get('/chat');
        setChats(res.data.chats || []);
        if (res.data.chats && res.data.chats.length > 0) {
          // Load first chat inline
          try {
            const chatRes = await Api.get(`/chat/${res.data.chats[0].id}`);
            setCurrentChatId(res.data.chats[0].id);
            setMessages(chatRes.data.chat.mensajes || []);
          } catch (error) {
            console.error('Error loading chat:', error);
            setError('Error al cargar el chat');
          }
        } else {
          // Create new chat inline
          try {
            const newChatRes = await Api.post('/chat', {});
            setCurrentChatId(newChatRes.data.chat.id);
            setMessages([]);
            // Refresh chats list
            const refreshRes = await Api.get('/chat');
            setChats(refreshRes.data.chats || []);
            setTimeout(() => {
              setMessages([
                {
                  id: Date.now(),
                  rol: 'asistente',
                  contenido: '¡Hola! Soy tu asistente virtual universitario. ¿En qué puedo ayudarte hoy?'
                }
              ]);
            }, 200);
          } catch (error) {
            console.error('Error creating new chat:', error);
            setError('Error al crear nuevo chat');
          }
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Error al cargar los chats');
      }
    };
    
    loadInitialChats();
  }, []);

  // Fetch all chats
  const fetchChats = async (token: string) => {
    try {
      const res = await Api.get('/chat');
      setChats(res.data.chats || []);
      if (res.data.chats && res.data.chats.length > 0) {
        loadChat(res.data.chats[0].id, token);
      } else {
        handleNewChat(token);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Error al cargar los chats');
    }
  };

  // Load messages for a chat
  const loadChat = async (chatId: number, tokenOverride?: string) => {
    const token = tokenOverride || authToken;
    if (!token) return;
    try {
      const res = await Api.get(`/chat/${chatId}`);
      setCurrentChatId(chatId);
      setMessages(res.data.chat.mensajes || []);
    } catch (error) {
      console.error('Error loading chat:', error);
      setError('Error al cargar el chat');
    }
  };

  // Create new chat
  const handleNewChat = async (tokenOverride?: string) => {
    const token = tokenOverride || authToken;
    if (!token) return;
    try {
      const res = await Api.post('/chat', {});
      setCurrentChatId(res.data.chat.id);
      setMessages([]);
      fetchChats(token);
      setTimeout(() => {
        setMessages([
          {
            id: Date.now(),
            rol: 'asistente',
            contenido: '¡Hola! Soy tu asistente virtual universitario. ¿En qué puedo ayudarte hoy?'
          }
        ]);
      }, 200);
    } catch {
      setError('Error al crear nuevo chat');
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !currentChatId || !authToken) return;
    const userMsg: MessageType = {
      id: Date.now(),
      rol: 'usuario',
      contenido: message
    };
    setMessages((prev) => [...prev, userMsg]);
    updateChatHistory('user', userMsg.contenido); // Actualizar historial
    setMessage('');
    setIsTyping(true);
    
    try {
      const res = await Api.post(`/chat/${currentChatId}/messages`, { mensaje: userMsg.contenido });
      
      setIsTyping(false);
      
      // Sistema híbrido: nuevo formato + fallback a formato antiguo
      const contenidoCompleto = res.data.mensaje_asistente?.contenido || 'Sin respuesta';
      let documentos = res.data.documentos_descargables || [];
      const fuentesConsultadas = res.data.fuentes_consultadas || [];
      
      // Debug: mostrar estructura completa de la respuesta
      console.log('🔍 Respuesta completa del backend:', res.data);
      console.log('📄 Documentos descargables:', documentos);
      
      // Si no hay documentos en formato nuevo, parsear formato antiguo
      let contenidoLimpio = contenidoCompleto;
      if (documentos.length === 0) {
        // Detectar fuentes en el texto - múltiples formatos posibles:
        // Formato 1: "Fuente: Nombre_Documento_0"
        // Formato 2: "en el "Nombre_Documento_0""
        // Formato 3: "según el "Nombre_Documento_0""
        let fuenteMatch = contenidoCompleto.match(/Fuente:\s*([^\s]+)/);
        
        if (!fuenteMatch) {
          // Intentar formato con comillas: "en el "Documento_0"" o "según el "Documento_0""
          fuenteMatch = contenidoCompleto.match(/(?:en el|según el|del|de la)\s*"([^"]+)"/);
        }
        
        if (!fuenteMatch) {
          // Intentar formato general con comillas: "Documento_0"
          fuenteMatch = contenidoCompleto.match(/"([A-Za-z_]+_\d+)"/);
        }
        
        if (fuenteMatch && fuenteMatch[1]) {
          const nombreFuente = fuenteMatch[1].trim();
          console.log('🔍 Fuente detectada:', nombreFuente);
          
          // Limpiar contenido removiendo referencias a la fuente
          contenidoLimpio = contenidoCompleto
            .replace(/\s*Fuente:\s*.+$/, '')
            .replace(/\s*Esta información se encuentra en el "[^"]+"\.\s*/, '. ')
            .replace(/\s*según (?:el|la) "[^"]+"\s*/, ' ')
            .replace(/\s*en (?:el|la) "[^"]+"\s*/, ' ')
            .trim();
          
          // Crear documento simulado basado en la fuente
          documentos = [{
            id: Date.now(), // ID temporal - será reemplazado por la descarga
            titulo: nombreFuente.replace(/_/g, ' ').replace(/\d+$/, '').trim(),
            descripcion: 'Documento fuente de la información proporcionada por el chatbot',
            nombre_archivo: nombreFuente + '.pdf',
            tipo_archivo: 'application/pdf',
            tamaño_archivo: 'Disponible',
            url_descarga: `/api/documents/download/${nombreFuente}`,
            fuente_original: nombreFuente,
            similitud_fuente: 1.0
          }];
          
          console.log('📄 Documento creado:', documentos[0]);
        }
      }
      
      const assistantMsg: MessageType = {
        id: Date.now() + 2,
        rol: 'asistente',
        contenido: contenidoLimpio,
        documentos_descargables: documentos.length > 0 ? documentos : undefined
      };
      
      // Mostrar información de fuentes consultadas en consola para debug
      if (fuentesConsultadas.length > 0) {
        console.log('📚 Fuentes consultadas:', fuentesConsultadas);
      }
      
      setMessages((prev) => [...prev, assistantMsg]);
      updateChatHistory('assistant', assistantMsg.contenido); // Actualizar historial
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      const errorMsg: MessageType = {
        id: Date.now() + 2,
        rol: 'asistente',
        contenido: 'Lo siento, hubo un error de conexión. Intenta nuevamente.'
      };
      setMessages((prev) => [...prev, errorMsg]);
      updateChatHistory('assistant', errorMsg.contenido); // Actualizar historial
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');  // Cambiado de 'token' a 'authToken'
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  // Admin panel nav
  const handleAdminNav = (action: string) => {
    setShowAdminPanel(false);
    switch (action) {
      case 'users':
        window.location.href = '/admin/gestion-usuarios.html';
        break;
      case 'settings':
        alert('Configuración - Próximamente disponible');
        break;
      case 'others':
        alert('Otras funciones administrativas - Próximamente disponible');
        break;
      default:
        break;
    }
  };

  // ========================================
  // SISTEMA DE TICKETS
  // ========================================

  const updateChatHistory = (role: string, content: string) => {
    setChatHistory(prev => {
      const newHistory = [...prev, {
        role,
        content,
        timestamp: new Date().toISOString()
      }];
      
      // Mantener solo los últimos 20 mensajes
      if (newHistory.length > 20) {
        return newHistory.slice(-20);
      }
      return newHistory;
    });
    
    // Incrementar contador solo para mensajes del usuario
    if (role === 'user') {
      setMessageCount(prev => {
        const newCount = prev + 1;
        // Mostrar botón después de 3 mensajes
        if (newCount >= 3) {
          setShowTicketButton(true);
        }
        return newCount;
      });
    }
  };

  const openTicketModal = () => {
    setShowTicketModal(true);
    document.body.style.overflow = 'hidden';
    
    // Pre-llenar el título si hay mensajes recientes
    const lastUserMessage = chatHistory.filter(msg => msg.role === 'user').pop();
    if (lastUserMessage) {
      setTicketForm(prev => ({
        ...prev,
        titulo: `Consulta sobre: ${lastUserMessage.content.substring(0, 50)}...`
      }));
    }
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    document.body.style.overflow = 'auto';
    
    // Limpiar formulario y errores
    setTicketForm({
      titulo: '',
      descripcion: '',
      categoria: '',
      prioridad: 'media',
      includeContext: true
    });
    setError(''); // Limpiar mensajes de error/éxito
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentChatId || !authToken) return;
    
    try {
      const ticketData = {
        titulo: ticketForm.titulo,
        descripcion: ticketForm.descripcion,
        categoria: ticketForm.categoria,
        prioridad: ticketForm.prioridad,
        chat_id: currentChatId,
        contextoChat: ticketForm.includeContext ? chatHistory.slice(-10) : []
      };

      const response = await Api.post('/tickets/crear-con-contexto', ticketData);

      if (response.data.success) {
        // Mostrar mensaje de éxito en el chat
        const successMessage: MessageType = {
          id: Date.now(),
          rol: 'asistente',
          contenido: `🎫 **Ticket Creado Exitosamente**\n\n**Número:** #${response.data.data.id}\n**Estado:** Abierto\n**Categoría:** ${translateTicketCategory(response.data.data.categoria)}\n**Prioridad:** ${translateTicketPriority(response.data.data.prioridad)}\n\nHemos recibido tu solicitud. Te notificaremos cuando tengamos una respuesta.`
        };
        
        setMessages(prev => [...prev, successMessage]);
        updateChatHistory('assistant', successMessage.contenido);
        
        closeTicketModal();
        setShowTicketButton(false); // Ocultar botón después de crear ticket
      }
    } catch (error) {
      console.error('Error creando ticket:', error);
      setError('Error al crear el ticket. Intenta nuevamente.');
    }
  };

  const translateTicketCategory = (category: string) => {
    const translations: { [key: string]: string } = {
      'consulta': 'Consulta General',
      'problema_tecnico': 'Problema Técnico',
      'sugerencia': 'Sugerencia',
      'queja': 'Queja',
      'otro': 'Otro'
    };
    return translations[category] || category;
  };

  const translateTicketPriority = (priority: string) => {
    const translations: { [key: string]: string } = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return translations[priority] || priority;
  };

  // ========================================
  // AUTOCOMPLETADO CON IA
  // ========================================

  const handleAutoComplete = async () => {
    if (!authToken) return;
    
    try {
      // Validar que haya contexto de chat
      if (!chatHistory || chatHistory.length === 0) {
        setError('No hay conversación disponible para generar sugerencias. Por favor, inicia una conversación con el chatbot antes de usar esta función.');
        return;
      }

      setIsAutoCompleting(true);

      // Preparar contexto para la API (últimos 10 mensajes)
      const contextoChat = chatHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString()
      }));

      // Llamar al endpoint de sugerencias
      const response = await Api.post('/tickets/generar-sugerencias', {
        contextoChat: contextoChat
      });

      if (response.data.success) {
        const { titulo, categoria, descripcion, prioridad } = response.data.data;
        
        // Aplicar las sugerencias a los campos del formulario
        setTicketForm(prev => ({
          ...prev,
          titulo: titulo || prev.titulo,
          categoria: categoria || prev.categoria,
          descripcion: descripcion || prev.descripcion,
          prioridad: prioridad || prev.prioridad
        }));

        // Limpiar cualquier error previo
        setError('');
        
        // Mostrar notificación temporal de éxito
        const successMsg = '✨ ¡Campos completados automáticamente! Revisa y ajusta la información generada según tus necesidades.';
        setError('SUCCESS:' + successMsg); // Usaremos el campo error para mostrar el mensaje de éxito temporalmente
        setTimeout(() => setError(''), 5000); // Limpiar después de 5 segundos
        
      } else {
        throw new Error(response.data.message || 'Error al generar sugerencias');
      }

    } catch (error) {
      console.error('Error en autocompletado:', error);
      setError(`Error al generar sugerencias automáticas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      
    } finally {
      setIsAutoCompleting(false);
    }
  };

  // ========================================
  // MODAL MIS TICKETS
  // ========================================

  const loadMyTickets = useCallback(async (resetPagination = true) => {
    try {
      setLoadingMyTickets(true);
      
      const params = new URLSearchParams();
      if (myTicketsFilterStatus !== 'todos') params.append('estado', myTicketsFilterStatus);
      if (myTicketsFilterCategory !== 'todos') params.append('categoria', myTicketsFilterCategory);
      params.append('limit', myTicketsPagination.limit.toString());
      params.append('offset', resetPagination ? '0' : myTicketsPagination.offset.toString());

      const response = await Api.get(`/tickets/mis-tickets?${params.toString()}`);
      
      if (response.data.success) {
        // Manejar diferentes estructuras de respuesta del backend
        let newTickets = [];
        let totalCount = 0;
        
        if (Array.isArray(response.data.data)) {
          // Estructura: { success: true, data: [...tickets] }
          newTickets = response.data.data;
          totalCount = response.data.data.length;
        } else if (response.data.data && response.data.data.tickets) {
          // Estructura: { success: true, data: { tickets: [...], total: X } }
          newTickets = response.data.data.tickets;
          totalCount = response.data.data.total || response.data.data.tickets.length;
        } else {
          console.warn('⚠️ Estructura de respuesta inesperada:', response.data);
        }
        
        if (resetPagination) {
          setMyTickets(newTickets);
          setMyTicketsPagination(prev => ({
            ...prev,
            offset: 0,
            total: totalCount,
            hasMore: newTickets.length >= prev.limit
          }));
        } else {
          setMyTickets(prev => [...prev, ...newTickets]);
          setMyTicketsPagination(prev => ({
            ...prev,
            offset: prev.offset + prev.limit,
            total: totalCount,
            hasMore: newTickets.length >= prev.limit
          }));
        }
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
      setError('Error al cargar los tickets');
    } finally {
      setLoadingMyTickets(false);
    }
  }, [myTicketsFilterStatus, myTicketsFilterCategory, myTicketsPagination.limit, myTicketsPagination.offset]);

  const filterMyTickets = useCallback(() => {
    let filtered = myTickets;

    if (myTicketsSearchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.titulo.toLowerCase().includes(myTicketsSearchTerm.toLowerCase()) ||
        ticket.descripcion.toLowerCase().includes(myTicketsSearchTerm.toLowerCase())
      );
    }

    setFilteredMyTickets(filtered);
  }, [myTickets, myTicketsSearchTerm]);

  const openMyTicketsModal = () => {
    setShowMyTicketsModal(true);
    document.body.style.overflow = 'hidden';
    loadMyTickets(true);
  };

  const closeMyTicketsModal = () => {
    setShowMyTicketsModal(false);
    document.body.style.overflow = 'auto';
    setSelectedMyTicket(null);
    setMyTicketsSearchTerm('');
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

  // ========================================
  // FUNCIONES DE TESTING PARA CONSOLA
  // ========================================

  const obtenerMisTickets = async (filtros: {
    estado?: string;
    categoria?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      const params = new URLSearchParams();
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.limit) params.append('limit', filtros.limit.toString());
      if (filtros.offset) params.append('offset', filtros.offset.toString());

      const response = await Api.get(`/tickets/mis-tickets?${params.toString()}`);
      console.log('✅ Mis Tickets obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo tickets:', error);
      throw error;
    }
  };

  const obtenerResumenMisTickets = async (limit = 10, offset = 0) => {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await Api.get(`/tickets/mis-tickets/resumen?${params.toString()}`);
      console.log('✅ Resumen de Mis Tickets obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo resumen de tickets:', error);
      throw error;
    }
  };

  const testearTickets = async () => {
    console.log('🧪 === INICIANDO PRUEBAS DE TICKETS ===');
    
    try {
      // Verificar token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('❌ No hay token de autenticación. Inicia sesión primero.');
        return;
      }
      console.log('✅ Token encontrado:', token.substring(0, 20) + '...');

      // Probar obtener todos los tickets
      console.log('\n📋 1. Obteniendo todos mis tickets...');
      const todosLosTickets = await obtenerMisTickets();

      // Probar filtros por estado
      console.log('\n🔍 2. Probando filtro por estado "abierto"...');
      await obtenerMisTickets({ estado: 'abierto' });

      // Probar filtros por categoría
      console.log('\n🏷️ 3. Probando filtro por categoría "problema_tecnico"...');
      await obtenerMisTickets({ categoria: 'problema_tecnico' });

      // Probar paginación
      console.log('\n📄 4. Probando paginación (limit=5, offset=0)...');
      await obtenerMisTickets({ limit: 5, offset: 0 });

      // Probar resumen (si el endpoint existe)
      console.log('\n📊 5. Obteniendo resumen de tickets...');
      try {
        await obtenerResumenMisTickets();
      } catch (error) {
        console.log('ℹ️ Endpoint de resumen no disponible o no implementado');
      }

      console.log('\n✅ === PRUEBAS COMPLETADAS EXITOSAMENTE ===');
      console.log('📊 Total de tickets encontrados:', todosLosTickets.data?.total || todosLosTickets.data?.tickets?.length || 0);
      
    } catch (error) {
      console.error('❌ === ERROR DURANTE LAS PRUEBAS ===');
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as any;
        console.error('Error:', axiosError.response?.data || axiosError.message);
        
        if (axiosError.response?.status === 401) {
          console.error('🔐 Error de autenticación. El token puede haber expirado.');
        }
      } else {
        console.error('Error desconocido:', error);
      }
    }
  };

  // Función específica para probar el modal
  const probarModal = () => {
    console.log('🔔 Probando modal de tickets...');
    console.log('Estado actual:', { 
      showMyTicketsModal, 
      myTicketsCount: myTickets.length,
      filteredCount: filteredMyTickets.length,
      loading: loadingMyTickets 
    });
    
    if (!showMyTicketsModal) {
      console.log('📂 Abriendo modal...');
      openMyTicketsModal();
    } else {
      console.log('✅ Modal ya está abierto');
      console.log('📋 Tickets actuales:', myTickets);
      console.log('🔍 Tickets filtrados:', filteredMyTickets);
    }
  };

  // Función para simular tickets de prueba
  const simularTickets = () => {
    console.log('🎭 Simulando tickets de prueba...');
    const ticketsPrueba: TicketType[] = [
      {
        id: 1,
        titulo: 'Problema con el sistema de login',
        descripcion: 'No puedo iniciar sesión en la aplicación. Me aparece un error 500.',
        categoria: 'problema_tecnico',
        prioridad: 'alta',
        estado: 'abierto',
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
      },
      {
        id: 2,
        titulo: 'Consulta sobre funcionalidades',
        descripcion: '¿Cómo puedo cambiar mi contraseña desde el perfil?',
        categoria: 'consulta',
        prioridad: 'media',
        estado: 'resuelto',
        fecha_creacion: new Date(Date.now() - 86400000).toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        respuesta_admin: 'Para cambiar tu contraseña, ve a Perfil > Configuración > Cambiar Contraseña.',
        admin_respuesta: {
          id: 1,
          nombre: 'Admin',
          apellido: 'Sistema'
        }
      },
      {
        id: 3,
        titulo: 'Sugerencia de mejora',
        descripcion: 'Sería genial tener un modo oscuro en la aplicación.',
        categoria: 'sugerencia',
        prioridad: 'baja',
        estado: 'en_proceso',
        fecha_creacion: new Date(Date.now() - 172800000).toISOString(),
        fecha_actualizacion: new Date(Date.now() - 86400000).toISOString(),
      }
    ];

    setMyTickets(ticketsPrueba);
    setMyTicketsPagination(prev => ({
      ...prev,
      total: ticketsPrueba.length,
      offset: 0,
      hasMore: false
    }));
    
    console.log('✅ Tickets simulados cargados:', ticketsPrueba);
    
    if (!showMyTicketsModal) {
      setShowMyTicketsModal(true);
      document.body.style.overflow = 'hidden';
    }
  };

  // Exponer funciones para testing en consola (solo en desarrollo)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).testearTickets = testearTickets;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).obtenerMisTickets = obtenerMisTickets;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).obtenerResumenMisTickets = obtenerResumenMisTickets;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).probarModal = probarModal;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).abrirModal = openMyTicketsModal;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).cerrarModal = closeMyTicketsModal;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).simularTickets = simularTickets;
      
      console.log('🧪 Funciones de testing disponibles en consola:');
      console.log('- testearTickets() - Ejecuta todas las pruebas');
      console.log('- obtenerMisTickets(filtros) - Obtiene tickets con filtros');
      console.log('- obtenerResumenMisTickets(limit, offset) - Obtiene resumen');
      console.log('- probarModal() - Prueba específica del modal');
      console.log('- abrirModal() - Abre el modal directamente');
      console.log('- cerrarModal() - Cierra el modal');
      console.log('- simularTickets() - Carga tickets de prueba y abre el modal');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect para filtrar tickets cuando cambian
  useEffect(() => {
    filterMyTickets();
  }, [filterMyTickets]);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)',
      padding: '0',
      margin: '0',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'fixed',
      top: '0',
      left: '0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '0',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)',
          color: '#ffffff',
          padding: isMobile ? '12px 16px' : '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(4, 120, 87, 0.3)',
          flexShrink: 0,
          minHeight: isMobile ? '60px' : '70px',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: isMobile ? '48px' : '56px',
              height: isMobile ? '48px' : '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <User color="#ffffff" size={isMobile ? 24 : 28} />
            </div>
            <div>
              <h3 style={{ 
                margin: '0 0 4px 0', 
                fontWeight: '700', 
                fontSize: isMobile ? '16px' : '20px',
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}>
                {user ? `${user.nombre} ${user.apellido}` : 'Cargando...'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ 
                  fontSize: isMobile ? '13px' : '15px', 
                  opacity: 0.95, 
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontWeight: '500',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  {user?.rol === 'administrador' ? 'Administrador' : 
                   user?.rol === 'personal' ? 'Personal' : 
                   user?.rol === 'alumno' ? 'Alumno' : 
                   user?.rol || 'Usuario'}
                </span>
                {user?.rol === 'administrador' && (
                  <div style={{ position: 'relative' }}>
                    <button
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setShowAdminPanel(!showAdminPanel)}
                    >
                      <University size={14} />
                      <span>Admin</span>
                    </button>
                    {showAdminPanel && (
                      <div style={{
                        position: 'absolute',
                        top: '48px',
                        right: '0',
                        background: '#ffffff',
                        color: '#1f2937',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                        minWidth: '260px',
                        zIndex: 1000,
                        overflow: 'hidden',
                        border: '1px solid rgba(4, 120, 87, 0.1)'
                      }}>
                        <div style={{
                          padding: '20px',
                          borderBottom: '1px solid #ecf0f1',
                          background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                          color: '#ffffff'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <University size={20} />
                            <span style={{ fontWeight: '700', fontSize: '16px' }}>Panel Administrativo</span>
                          </div>
                        </div>
                        <div style={{ padding: '16px' }}>
                          {[
                            { key: 'users', icon: Users, label: 'Gestión de Usuarios' },
                            { key: 'settings', icon: Settings, label: 'Configuración' },
                            { key: 'others', icon: FileText, label: 'Otros' }
                          ].map(({ key, icon: Icon, label }) => (
                            <button
                              key={key}
                              style={{
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                marginBottom: '4px',
                                color: '#1f2937'
                              }}
                              onClick={() => handleAdminNav(key)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8f9fa';
                                e.currentTarget.style.color = '#10b981';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                                e.currentTarget.style.color = '#1f2937';
                              }}
                            >
                              <Icon size={18} />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Campanita de Mis Tickets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={openMyTicketsModal}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                padding: '0',
                outline: 'none',
                fontSize: 'inherit',
                fontWeight: 'normal',
                fontFamily: 'inherit',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Mis Tickets"
            >
              {/* SVG Bell Icon como alternativa */}
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ display: 'block' }}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {/* Indicador de nuevos tickets (opcional) */}
              <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: '#ff4757',
                borderRadius: '50%',
                width: '8px',
                height: '8px',
                display: 'none' // Se mostraría cuando haya nuevos tickets
              }} />
            </button>
            
            <button
              onClick={handleLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: isMobile ? '8px 12px' : '12px 20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              fontSize: isMobile ? '12px' : '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <LogOut size={isMobile ? 16 : 18} />
            {!isMobile && <span>Cerrar Sesión</span>}
          </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          display: 'flex', 
          height: 'calc(100vh - 70px)',
          flexDirection: isMobile ? 'column' : 'row',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Sidebar */}
          <div style={{
            width: isMobile ? '100%' : '280px',
            background: 'linear-gradient(180deg, #1f2937 0%, #0f172a 100%)',
            padding: isMobile ? '12px' : '20px',
            borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: isMobile ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            height: isMobile ? 'auto' : '100%',
            maxHeight: isMobile ? '200px' : 'none',
            overflowY: 'auto',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            <button
              onClick={() => handleNewChat()}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                color: '#ffffff',
                borderRadius: '12px',
                padding: isMobile ? '12px' : '16px',
                fontWeight: '600',
                marginBottom: isMobile ? '16px' : '20px',
                marginTop: isMobile ? '24px' : '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(4, 120, 87, 0.25)',
                flexShrink: 0,
                minHeight: isMobile ? '48px' : '52px',
                position: 'relative',
                zIndex: 1,
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(4, 120, 87, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #047857 0%, #065f46 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(4, 120, 87, 0.25)';
              }}
            >
              <Plus size={16} />
              Nuevo Chat
            </button>
            
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              maxHeight: isMobile ? 'calc(200px - 140px)' : 'calc(100vh - 260px)',
              paddingTop: '0'
            }}>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  style={{
                    padding: isMobile ? '12px' : '16px 20px',
                    borderRadius: '10px',
                    marginBottom: isMobile ? '8px' : '12px',
                    background: currentChatId === chat.id 
                      ? 'linear-gradient(135deg, rgba(4, 120, 87, 0.2) 0%, rgba(6, 95, 70, 0.1) 100%)'
                      : 'transparent',
                    cursor: 'pointer',
                    fontWeight: currentChatId === chat.id ? '600' : '500',
                    color: currentChatId === chat.id ? '#10b981' : '#bdc3c7',
                    transition: 'all 0.3s ease',
                    border: currentChatId === chat.id ? '1px solid rgba(4, 120, 87, 0.3)' : '1px solid transparent',
                    minHeight: isMobile ? '50px' : '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                  onClick={() => loadChat(chat.id)}
                  onMouseEnter={(e) => {
                    if (currentChatId !== chat.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentChatId !== chat.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#bdc3c7';
                    }
                  }}
                >
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: isMobile ? '13px' : '15px',
                    lineHeight: '1.4',
                    marginBottom: '4px'
                  }}>
                    {chat.titulo}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '11px' : '13px',
                    opacity: 0.7,
                    marginTop: '2px',
                    lineHeight: '1.3'
                  }}>
                    {new Date(chat.fecha_actualizacion || chat.fecha_creacion || '').toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Content */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: isMobile ? '20px 12px 8px 12px' : '24px 20px 16px 20px',
              paddingBottom: isMobile ? '80px' : '100px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '12px' : '16px',
              background: 'linear-gradient(180deg, #f8fdfa 0%, #ecf9f5 100%)',
              minHeight: 0
            }}>
              {messages.length === 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: isMobile ? '12px' : '16px',
                  animation: 'slideIn 0.3s ease-out',
                  marginBottom: '8px',
                  marginTop: isMobile ? '20px' : '32px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
                    borderRadius: '50%',
                    width: isMobile ? '40px' : '44px',
                    height: isMobile ? '40px' : '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(4, 120, 87, 0.4)',
                    flexShrink: 0
                  }}>
                    <Bot color="#ffffff" size={isMobile ? 20 : 24} />
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    padding: isMobile ? '14px 18px' : '18px 22px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    maxWidth: isMobile ? '80%' : '75%',
                    border: '1px solid rgba(4, 120, 87, 0.1)',
                    fontSize: isMobile ? '14px' : '15px',
                    lineHeight: '1.6',
                    color: '#1f2937'
                  }}>
                    ¡Hola! Soy tu asistente virtual universitario. ¿En qué puedo ayudarte hoy?
                  </div>
                </div>
              )}
              
              {messages.map((msg, index) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: isMobile ? '12px' : '16px',
                  animation: 'slideIn 0.3s ease-out',
                  marginBottom: '8px',
                  marginTop: index === 0 ? (isMobile ? '20px' : '32px') : '0px'
                }}>
                  <div style={{
                    background: msg.rol === 'usuario' 
                      ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
                    borderRadius: '50%',
                    width: isMobile ? '40px' : '44px',
                    height: isMobile ? '40px' : '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: msg.rol === 'usuario' ? '2px solid #10b981' : 'none',
                    boxShadow: msg.rol === 'usuario' 
                      ? '0 4px 15px rgba(4, 120, 87, 0.2)'
                      : '0 4px 15px rgba(4, 120, 87, 0.4)',
                    flexShrink: 0
                  }}>
                    {msg.rol === 'usuario' ? 
                      <User color="#10b981" size={isMobile ? 20 : 24} /> : 
                      <Bot color="#ffffff" size={isMobile ? 20 : 24} />
                    }
                  </div>
                  <div style={{ maxWidth: isMobile ? '80%' : '75%' }}>
                    <div style={{
                      background: msg.rol === 'usuario' 
                        ? 'linear-gradient(135deg, #e8f8f5 0%, #d5f4e6 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      borderRadius: '16px',
                      padding: isMobile ? '14px 18px' : '18px 22px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(4, 120, 87, 0.1)',
                      fontSize: isMobile ? '14px' : '15px',
                      lineHeight: '1.6',
                      wordBreak: 'break-word',
                      color: '#1f2937'
                    }}>
                      {msg.contenido}
                    </div>
                    
                    {msg.rol === 'asistente' && msg.documentos_descargables && msg.documentos_descargables.length > 0 && (
                      <div style={{
                        marginTop: '8px',
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        borderRadius: '12px',
                        border: '1px solid rgba(14, 116, 144, 0.15)',
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => toggleDocuments(msg.id)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#0e7490',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(14, 116, 144, 0.05)'}
                          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                        >
                          <span>Documentos ({msg.documentos_descargables.length})</span>
                          {expandedDocuments.has(msg.id) ? 
                            <ChevronUp size={16} /> : 
                            <ChevronDown size={16} />
                          }
                        </button>
                        
                        {expandedDocuments.has(msg.id) && (
                          <div style={{
                            padding: '0 16px 16px 16px',
                            borderTop: '1px solid rgba(14, 116, 144, 0.1)'
                          }}>
                            {msg.documentos_descargables.map((doc) => (
                              <div key={doc.id} style={{
                                background: '#ffffff',
                                borderRadius: '8px',
                                padding: '12px',
                                marginTop: '8px',
                                border: '1px solid rgba(14, 116, 144, 0.1)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                              }}>
                                <div style={{
                                  fontWeight: '600',
                                  color: '#1f2937',
                                  fontSize: '14px',
                                  marginBottom: '4px'
                                }}>
                                  {doc.titulo}
                                </div>
                                {doc.descripcion && (
                                  <div style={{
                                    color: '#6b7280',
                                    fontSize: '13px',
                                    marginBottom: '8px',
                                    lineHeight: '1.4'
                                  }}>
                                    {doc.descripcion}
                                  </div>
                                )}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '12px',
                                  color: '#6b7280'
                                }}>
                                  <span>
                                    {doc.nombre_archivo} • {obtenerTipoArchivo(doc.tipo_archivo)} • {formatearTamañoArchivo(doc.tamaño_archivo)}
                                    {doc.similitud_fuente && doc.similitud_fuente > 0.5 && (
                                      <span style={{ color: '#059669', marginLeft: '8px' }}>
                                        ✅ {Math.round(doc.similitud_fuente * 100)}% coincidencia
                                      </span>
                                    )}
                                  </span>
                                  <button
                                    onClick={() => {
                                      descargarDocumento(doc.id, doc.nombre_archivo, doc.fuente_original);
                                    }}
                                    style={{
                                      background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
                                      color: '#ffffff',
                                      textDecoration: 'none',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      transition: 'all 0.2s',
                                      boxShadow: '0 2px 4px rgba(14, 116, 144, 0.2)',
                                      border: 'none',
                                      cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                      (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                                      (e.target as HTMLElement).style.boxShadow = '0 4px 8px rgba(14, 116, 144, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.target as HTMLElement).style.transform = 'translateY(0)';
                                      (e.target as HTMLElement).style.boxShadow = '0 2px 4px rgba(14, 116, 144, 0.2)';
                                    }}
                                  >
                                    📥 Descargar
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: isMobile ? '12px' : '16px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
                    borderRadius: '50%',
                    width: isMobile ? '40px' : '44px',
                    height: isMobile ? '40px' : '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(4, 120, 87, 0.4)',
                    flexShrink: 0
                  }}>
                    <Bot color="#ffffff" size={isMobile ? 20 : 24} />
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    padding: isMobile ? '14px 18px' : '18px 22px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(4, 120, 87, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#7f8c8d', fontSize: isMobile ? '12px' : '14px' }}>Escribiendo</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: isMobile ? '4px' : '6px',
                            height: isMobile ? '4px' : '6px',
                            borderRadius: '50%',
                            background: '#10b981',
                            animation: 'bounce 1.4s infinite ease-in-out both',
                            animationDelay: `${-0.32 + i * 0.16}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div style={{
              padding: isMobile ? '8px 12px 12px' : '12px 20px 16px',
              borderTop: '1px solid rgba(4, 120, 87, 0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              backdropFilter: 'blur(20px)',
              flexShrink: 0,
              position: 'sticky',
              bottom: 0,
              zIndex: 10
            }}>
              <div style={{
                display: 'flex',
                gap: isMobile ? '8px' : '12px',
                alignItems: 'flex-end'
              }}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={1}
                  style={{
                    flex: 1,
                    resize: 'none',
                    borderRadius: '16px',
                    border: '2px solid #e8f8f5',
                    padding: isMobile ? '12px 16px' : '16px 20px',
                    fontSize: isMobile ? '14px' : '15px',
                    minHeight: isMobile ? '44px' : '52px',
                    maxHeight: isMobile ? '88px' : '120px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: '#ffffff',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                    color: '#1f2937',
                    lineHeight: '1.4'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 4px 20px rgba(4, 120, 87, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e8f8f5';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isTyping}
                  style={{
                    background: (!message.trim() || isTyping) 
                      ? '#95a5a6' 
                      : 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '16px',
                    padding: isMobile ? '12px 16px' : '16px 20px',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (!message.trim() || isTyping) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: (!message.trim() || isTyping) 
                      ? '0 2px 8px rgba(149, 165, 166, 0.3)' 
                      : '0 4px 15px rgba(4, 120, 87, 0.3)',
                    minWidth: isMobile ? '44px' : '60px',
                    height: isMobile ? '44px' : '52px'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #047857 0%, #10b981 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #065f46 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Send size={isMobile ? 16 : 20} />
                </button>
              </div>
              {error && (
                <div style={{
                  color: '#e74c3c',
                  marginTop: '8px',
                  padding: isMobile ? '8px 12px' : '12px 16px',
                  background: 'rgba(231, 76, 60, 0.1)',
                  border: '1px solid rgba(231, 76, 60, 0.3)',
                  borderRadius: '12px',
                  fontSize: isMobile ? '12px' : '14px'
                }}>
                  {error}
                </div>
              )}
              
              {/* Botón de Ticket */}
              {showTicketButton && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: '12px',
                  border: '1px solid #dee2e6',
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px',
                    flexDirection: isMobile ? 'column' : 'row'
                  }}>
                    <span style={{
                      color: '#6c757d',
                      fontSize: '14px',
                      fontWeight: '500',
                      textAlign: isMobile ? 'center' : 'left'
                    }}>
                      ¿No encontraste lo que buscabas?
                    </span>
                    <button
                      onClick={openTicketModal}
                      style={{
                        background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(23, 162, 184, 0.2)',
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #138496 0%, #117a8b 100%)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(23, 162, 184, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(23, 162, 184, 0.2)';
                      }}
                    >
                      <Ticket size={16} />
                      Crear Ticket de Soporte
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Ticket */}
      {showTicketModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            maxWidth: isMobile ? '95%' : '600px',
            width: isMobile ? '95%' : '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {/* Header del Modal */}
            <div style={{
              background: 'linear-gradient(135deg, #006A4E 0%, #8A9A5B 100%)',
              color: 'white',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '16px 16px 0 0'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: 0
              }}>
                <Ticket size={24} />
                Crear Ticket de Soporte
              </h3>
              <button
                onClick={closeTicketModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '4px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                ✕
              </button>
            </div>

            {/* Botón de Autocompletar con IA */}
            <div style={{
              padding: '20px 30px 0px 30px',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <button
                type="button"
                onClick={handleAutoComplete}
                disabled={isAutoCompleting || chatHistory.length === 0}
                style={{
                  width: '100%',
                  background: isAutoCompleting 
                    ? '#95a5a6' 
                    : chatHistory.length === 0
                      ? '#bdc3c7'
                      : 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isAutoCompleting || chatHistory.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: isAutoCompleting || chatHistory.length === 0 
                    ? 'none' 
                    : '0 4px 15px rgba(155, 89, 182, 0.3)',
                  marginBottom: '20px'
                }}
                onMouseEnter={(e) => {
                  if (!isAutoCompleting && chatHistory.length > 0) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(155, 89, 182, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAutoCompleting && chatHistory.length > 0) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(155, 89, 182, 0.3)';
                  }
                }}
              >
                {isAutoCompleting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Generando con IA...
                  </>
                ) : (
                  <>
                    ✨ Autocompletar con IA
                  </>
                )}
              </button>
              {chatHistory.length === 0 && (
                <p style={{
                  margin: '8px 0 0 0',
                  fontSize: '12px',
                  color: '#7f8c8d',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  Inicia una conversación para usar el autocompletado inteligente
                </p>
              )}
            </div>

            {/* Cuerpo del Modal */}
            <form onSubmit={handleTicketSubmit} style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Título del Ticket *
                </label>
                <input
                  type="text"
                  value={ticketForm.titulo}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Describe brevemente tu problema o consulta"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#006A4E';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 106, 78, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Categoría *
                  </label>
                  <select
                    value={ticketForm.categoria}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, categoria: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                      fontFamily: 'inherit',
                      background: 'white',
                      color: '#333'
                    }}
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="consulta">Consulta General</option>
                    <option value="problema_tecnico">Problema Técnico</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="queja">Queja</option>
                    <option value="otro">Otro</option>
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
                    Prioridad *
                  </label>
                  <select
                    value={ticketForm.prioridad}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, prioridad: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                      fontFamily: 'inherit',
                      background: 'white',
                      color: '#333'
                    }}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Descripción Detallada *
                </label>
                <textarea
                  value={ticketForm.descripcion}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe detalladamente tu problema, consulta o sugerencia..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#006A4E';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 106, 78, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  <input
                    type="checkbox"
                    checked={ticketForm.includeContext}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, includeContext: e.target.checked }))}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  Incluir contexto de la conversación actual
                </label>
                <small style={{
                  color: '#7f8c8d',
                  fontSize: '12px',
                  marginTop: '5px',
                  display: 'block',
                  marginLeft: '30px'
                }}>
                  Se incluirán los últimos mensajes de esta conversación para dar contexto al equipo de soporte.
                </small>
              </div>

              {/* Mensaje de estado */}
              {error && (
                <div style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: error.startsWith('SUCCESS:') 
                    ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
                    : 'rgba(231, 76, 60, 0.1)',
                  color: error.startsWith('SUCCESS:') ? '#155724' : '#e74c3c',
                  border: `1px solid ${error.startsWith('SUCCESS:') ? '#c3e6cb' : 'rgba(231, 76, 60, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  <span style={{ flexShrink: 0, marginTop: '1px' }}>
                    {error.startsWith('SUCCESS:') ? '✅' : '⚠️'}
                  </span>
                  <span style={{ lineHeight: '1.4' }}>
                    {error.startsWith('SUCCESS:') ? error.substring(8) : error}
                  </span>
                </div>
              )}

              {/* Footer del Modal */}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'flex-end',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  type="button"
                  onClick={closeTicketModal}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: 'none',
                    background: '#6c757d',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'linear-gradient(135deg, #006A4E 0%, #8A9A5B 100%)',
                    color: 'white',
                    boxShadow: '0 2px 4px rgba(0, 106, 78, 0.2)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #005a42 0%, #7a8a4f 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #006A4E 0%, #8A9A5B 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Ticket size={16} />
                  Crear Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Mis Tickets */}
      {showMyTicketsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '20px' : '40px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '1200px',
            height: '90vh',
            maxHeight: '800px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden'
          }}>
            {/* Header del Modal */}
            <div style={{
              background: 'linear-gradient(135deg, #006A4E 0%, #8A9A5B 100%)',
              color: 'white',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* SVG Bell Icon para el título del modal */}
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ display: 'block', flexShrink: 0 }}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  Mis Tickets de Soporte
                </h2>
              </div>
              <button
                onClick={closeMyTicketsModal}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  padding: '0',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                {/* SVG X Icon */}
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ display: 'block' }}
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Lista de Tickets */}
              <div style={{ 
                width: selectedMyTicket ? '50%' : '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRight: selectedMyTicket ? '1px solid #e5e7eb' : 'none'
              }}>
                {/* Filtros */}
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #e5e7eb',
                  background: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                      <Search size={16} style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        color: '#6b7280' 
                      }} />
                      <input
                        type="text"
                        placeholder="Buscar tickets..."
                        value={myTicketsSearchTerm}
                        onChange={(e) => setMyTicketsSearchTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 10px 10px 40px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: 'white'
                        }}
                      />
                    </div>
                    <select
                      value={myTicketsFilterStatus}
                      onChange={(e) => setMyTicketsFilterStatus(e.target.value)}
                      style={{
                        padding: '10px',
                        border: '1px solid #d1d5db',
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
                    <button
                      onClick={() => loadMyTickets(true)}
                      disabled={loadingMyTickets}
                      style={{
                        background: loadingMyTickets ? '#9ca3af' : '#006A4E',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        cursor: loadingMyTickets ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      <RefreshCw size={14} style={{ 
                        animation: loadingMyTickets ? 'spin 1s linear infinite' : 'none' 
                      }} />
                      Actualizar
                    </button>
                  </div>
                </div>

                {/* Lista */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                  {loadingMyTickets ? (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '200px',
                      color: '#6b7280'
                    }}>
                      <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                      Cargando tickets...
                    </div>
                  ) : filteredMyTickets.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#6b7280', 
                      padding: '40px 20px' 
                    }}>
                      <Bell size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                      <h3 style={{ margin: '0 0 8px 0', color: '#9ca3af' }}>No hay tickets</h3>
                      <p style={{ margin: 0 }}>
                        {myTicketsSearchTerm || myTicketsFilterStatus !== 'todos'
                          ? 'No se encontraron tickets que coincidan con los filtros.'
                          : 'Aún no has creado ningún ticket. Ve al chat para crear tu primer ticket.'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {filteredMyTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedMyTicket(ticket)}
                          style={{
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: selectedMyTicket?.id === ticket.id ? '#f0f9ff' : 'white',
                            borderColor: selectedMyTicket?.id === ticket.id ? '#0ea5e9' : '#e5e7eb'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedMyTicket?.id !== ticket.id) {
                              e.currentTarget.style.background = '#f9fafb';
                              e.currentTarget.style.borderColor = '#d1d5db';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedMyTicket?.id !== ticket.id) {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                              #{ticket.id} - {ticket.titulo}
                            </h4>
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
                          </div>
                          <p style={{ 
                            margin: '0 0 12px 0', 
                            fontSize: '14px', 
                            color: '#6b7280',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {ticket.descripcion}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#9ca3af' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} />
                              {formatDate(ticket.fecha_creacion)}
                            </div>
                            <span style={{ 
                              padding: '2px 6px', 
                              background: '#f3f4f6', 
                              borderRadius: '4px',
                              color: '#374151'
                            }}>
                              {translateCategory(ticket.categoria)}
                            </span>
                            <span style={{ 
                              padding: '2px 6px', 
                              background: getStatusColor(ticket.prioridad), 
                              color: 'white',
                              borderRadius: '4px'
                            }}>
                              {translatePriority(ticket.prioridad)}
                            </span>
                            {ticket.respuesta_admin && (
                              <span style={{ 
                                padding: '2px 6px', 
                                background: '#dcfce7', 
                                color: '#166534',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}>
                                Respondido
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Cargar más */}
                      {myTicketsPagination.hasMore && (
                        <button
                          onClick={() => loadMyTickets(false)}
                          disabled={loadingMyTickets}
                          style={{
                            background: 'white',
                            border: '2px dashed #d1d5db',
                            color: '#6b7280',
                            padding: '16px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#9ca3af';
                            e.currentTarget.style.background = '#f9fafb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          <Eye size={16} />
                          Cargar más tickets
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Panel de Detalles */}
              {selectedMyTicket && (
                <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                  {/* Header del ticket */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                        Ticket #{selectedMyTicket.id}
                      </h3>
                      <button
                        onClick={() => setSelectedMyTicket(null)}
                        style={{
                          background: '#f3f4f6',
                          border: 'none',
                          color: '#6b7280',
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151', lineHeight: '1.4' }}>
                      {selectedMyTicket.titulo}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getStatusIcon(selectedMyTicket.estado)}
                        <span style={{ fontSize: '14px', fontWeight: '500', color: getStatusColor(selectedMyTicket.estado) }}>
                          {translateStatus(selectedMyTicket.estado)}
                        </span>
                      </div>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: 'white', 
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {translatePriority(selectedMyTicket.prioridad)}
                      </span>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: 'white', 
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {translateCategory(selectedMyTicket.categoria)}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                    {/* Fechas */}
                    <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                      <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Información
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <Calendar size={14} color="#6b7280" />
                          <span style={{ color: '#6b7280' }}>Creado:</span>
                          <span style={{ color: '#374151' }}>{formatDate(selectedMyTicket.fecha_creacion)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <Calendar size={14} color="#6b7280" />
                          <span style={{ color: '#6b7280' }}>Actualizado:</span>
                          <span style={{ color: '#374151' }}>{formatDate(selectedMyTicket.fecha_actualizacion)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                      <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Descripción
                      </h5>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '14px', 
                        color: '#374151', 
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        background: '#f8fafc',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {selectedMyTicket.descripcion}
                      </p>
                    </div>

                    {/* Respuesta del Admin */}
                    {selectedMyTicket.respuesta_admin && (
                      <div style={{ marginBottom: '20px' }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Respuesta del Administrador
                        </h5>
                        <div style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px',
                          padding: '16px'
                        }}>
                          <p style={{ 
                            margin: '0 0 12px 0', 
                            fontSize: '14px', 
                            color: '#374151', 
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {selectedMyTicket.respuesta_admin}
                          </p>
                          {selectedMyTicket.admin_respuesta && (
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#6b7280',
                              borderTop: '1px solid #bbf7d0',
                              paddingTop: '8px'
                            }}>
                              Respondido por: {selectedMyTicket.admin_respuesta.nombre} {selectedMyTicket.admin_respuesta.apellido}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Estado actual */}
                    <div style={{
                      background: selectedMyTicket.estado === 'resuelto' ? '#f0fdf4' : '#fefce8',
                      border: `1px solid ${selectedMyTicket.estado === 'resuelto' ? '#bbf7d0' : '#fde047'}`,
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                        {getStatusIcon(selectedMyTicket.estado)}
                        <span style={{ fontWeight: '600', color: '#374151' }}>
                          {translateStatus(selectedMyTicket.estado)}
                        </span>
                      </div>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '12px', 
                        color: '#6b7280',
                        fontStyle: 'italic'
                      }}>
                        {selectedMyTicket.estado === 'resuelto' 
                          ? 'Tu ticket ha sido resuelto. Si necesitas más ayuda, puedes crear un nuevo ticket.'
                          : selectedMyTicket.estado === 'en_proceso'
                          ? 'Tu ticket está siendo procesado por nuestro equipo de soporte.'
                          : selectedMyTicket.estado === 'cerrado'
                          ? 'Este ticket ha sido cerrado.'
                          : 'Tu ticket ha sido recibido y será procesado pronto.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations y Media Queries */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
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
          
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            } 40% {
              transform: scale(1);
            }
          }
          
          /* Scrollbar personalizado */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(4, 120, 87, 0.1);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #10b981 0%, #065f46 100%);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #047857 0%, #10b981 100%);
          }
          
          /* Asegurar que el textarea tenga buen contraste en todos los navegadores */
          textarea::placeholder {
            color: #7f8c8d !important;
            opacity: 1;
          }
          
          textarea::-webkit-input-placeholder {
            color: #7f8c8d !important;
          }
          
          textarea::-moz-placeholder {
            color: #7f8c8d !important;
            opacity: 1;
          }
          
          textarea:-ms-input-placeholder {
            color: #7f8c8d !important;
          }
          
          /* Responsividad adicional para tablets */
          @media (max-width: 1024px) and (min-width: 769px) {
            .chat-sidebar {
              width: 240px !important;
            }
          }
          
          /* Mejoras para pantallas muy pequeñas */
          @media (max-width: 480px) {
            body {
              overflow: hidden;
            }
            
            .sidebar {
              padding: 10px !important;
              max-height: 130px !important;
            }
            
            .nuevo-chat-btn {
              margin-top: 0 !important;
              margin-bottom: 10px !important;
              padding: 8px !important;
              min-height: 40px !important;
              font-size: 12px !important;
            }
            
            .chat-item {
              padding: 6px 8px !important;
              margin-bottom: 2px !important;
              min-height: 36px !important;
            }
            
            .messages-container {
              padding: 12px !important;
              padding-bottom: 6px !important;
            }
            
            .message-content {
              max-width: 90% !important;
              padding: 10px 14px !important;
              font-size: 12px !important;
            }
            
            .input-area {
              padding: 10px 12px 14px !important;
            }
            
            .textarea-input {
              padding: 10px 14px !important;
              font-size: 13px !important;
              min-height: 40px !important;
            }
            
            .send-button {
              min-width: 40px !important;
              height: 40px !important;
              padding: 10px !important;
            }
          }
          
          /* Asegurar que los elementos clickeables tengan suficiente área en móviles */
          @media (max-width: 768px) {
            body {
              overflow: hidden;
            }
            
            button {
              min-height: 44px;
            }
            
            .chat-item {
              min-height: 40px;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            
            .header-mobile {
              min-height: 60px !important;
              padding: 12px 16px !important;
            }
            
            .sidebar-mobile {
              max-height: 140px !important;
              padding: 12px !important;
            }
            
            .input-area-mobile {
              margin-top: auto !important;
              position: sticky !important;
              bottom: 0 !important;
            }
          }
          
          /* Optimización para tablets en orientación landscape */
          @media (max-width: 1024px) and (orientation: landscape) {
            .sidebar {
              width: 240px !important;
            }
            
            .header {
              padding: 12px 20px !important;
            }
          }
          
          /* Asegurar altura completa en todas las pantallas */
          @media (max-height: 600px) {
            .sidebar {
              max-height: 100px !important;
            }
            
            .nuevo-chat-btn {
              padding: 6px !important;
              margin-bottom: 8px !important;
              font-size: 11px !important;
              min-height: 36px !important;
            }
            
            .chat-item {
              padding: 4px 8px !important;
              margin-bottom: 1px !important;
              min-height: 32px !important;
            }
            
            .messages-area {
              flex: 1 !important;
              min-height: auto !important;
            }
            
            .header {
              min-height: 50px !important;
              padding: 8px 16px !important;
            }
          }
          
          /* Mejorar la legibilidad en modo oscuro del sistema */
          @media (prefers-color-scheme: dark) {
            textarea {
              background: #ffffff !important;
              color: #1f2937 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Chat;
