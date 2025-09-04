import React, { useEffect, useRef, useState } from 'react';
import Api from './Api';
import { LogOut, User, Bot, Plus, Users, Settings, FileText, University, Send } from 'lucide-react';

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
}

const Chat: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    
    fetchChats(token);
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
    setMessage('');
    setIsTyping(true);
    
    try {
      const res = await Api.post(`/chat/${currentChatId}/messages`, { mensaje: userMsg.contenido });
      
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          rol: 'asistente',
          contenido: res.data.mensaje_asistente?.contenido || 'Sin respuesta'
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          rol: 'asistente',
          contenido: 'Lo siento, hubo un error de conexión. Intenta nuevamente.'
        }
      ]);
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
        window.open('/admin/gestion-usuarios.html', '_blank');
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
                  <div style={{
                    background: msg.rol === 'usuario' 
                      ? 'linear-gradient(135deg, #e8f8f5 0%, #d5f4e6 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    padding: isMobile ? '14px 18px' : '18px 22px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    maxWidth: isMobile ? '80%' : '75%',
                    border: '1px solid rgba(4, 120, 87, 0.1)',
                    fontSize: isMobile ? '14px' : '15px',
                    lineHeight: '1.6',
                    wordBreak: 'break-word',
                    color: '#1f2937'
                  }}>
                    {msg.contenido}
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
            </div>
          </div>
        </div>
      </div>

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
