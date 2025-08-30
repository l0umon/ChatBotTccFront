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
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setAuthToken(token);
    if (userData) setUser(JSON.parse(userData));
    fetchChats(token);
  }, []);

  // Fetch all chats
  const fetchChats = async (token: string) => {
    try {
      const res = await Api.get('/chat', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(res.data.chats || []);
      if (res.data.chats && res.data.chats.length > 0) {
        loadChat(res.data.chats[0].id, token);
      } else {
        handleNewChat(token);
      }
    } catch {
      setError('Error al cargar los chats');
    }
  };

  // Load messages for a chat
  const loadChat = async (chatId: number, tokenOverride?: string) => {
    const token = tokenOverride || authToken;
    if (!token) return;
    try {
      const res = await Api.get(`/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentChatId(chatId);
      setMessages(res.data.chat.mensajes || []);
    } catch {
      setError('Error al cargar el chat');
    }
  };

  // Create new chat
  const handleNewChat = async (tokenOverride?: string) => {
    const token = tokenOverride || authToken;
    if (!token) return;
    try {
      const res = await Api.post('/chat', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const res = await Api.post(`/chat/${currentChatId}/messages`, { mensaje: userMsg.contenido }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          rol: 'asistente',
          contenido: res.data.mensaje_asistente?.contenido || 'Sin respuesta'
        }
      ]);
    } catch {
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
    localStorage.removeItem('token');
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

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #16a085 0%, #2c8d6f 50%, #34495e 100%)',
      padding: isMobile ? '10px' : '20px',
      margin: '0',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'fixed',
      top: '0',
      left: '0',
      overflow: 'auto'
    }}>
      <div style={{
        maxWidth: isMobile ? '100%' : '1400px',
        margin: '0 auto',
        borderRadius: isMobile ? '16px' : '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        backgroundColor: '#ffffff',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        height: isMobile ? 'calc(100vh - 20px)' : 'auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #16a085 0%, #138d75 50%, #117864 100%)',
          color: '#ffffff',
          padding: isMobile ? '16px 20px' : '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(22, 160, 133, 0.3)'
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
                color: '#ffffff'
              }}>
                {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: isMobile ? '13px' : '15px', opacity: 0.9, color: '#ffffff' }}>
                  {user?.rol === 'administrador' ? 'Administrador' : user?.rol === 'personal' ? 'Personal' : 'Alumno'}
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
                        color: '#2c3e50',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                        minWidth: '260px',
                        zIndex: 1000,
                        overflow: 'hidden',
                        border: '1px solid rgba(22, 160, 133, 0.1)'
                      }}>
                        <div style={{
                          padding: '20px',
                          borderBottom: '1px solid #ecf0f1',
                          background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
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
                                color: '#2c3e50'
                              }}
                              onClick={() => handleAdminNav(key)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8f9fa';
                                e.currentTarget.style.color = '#16a085';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                                e.currentTarget.style.color = '#2c3e50';
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
          minHeight: isMobile ? 'calc(100vh - 180px)' : '600px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Sidebar */}
          <div style={{
            width: isMobile ? '100%' : '280px',
            background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
            padding: isMobile ? '16px' : '24px',
            borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: isMobile ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            minHeight: isMobile ? 'auto' : '600px',
            maxHeight: isMobile ? '200px' : 'none',
            overflowY: isMobile ? 'auto' : 'visible'
          }}>
            <button
              onClick={() => handleNewChat()}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: isMobile ? '10px' : '14px 0',
                fontWeight: '600',
                marginBottom: isMobile ? '16px' : '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: isMobile ? '13px' : '14px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(22, 160, 133, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #16a085 0%, #138d75 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Plus size={16} />
              Nuevo Chat
            </button>
            
            <div style={{ maxHeight: isMobile ? '120px' : 'none', overflowY: 'auto' }}>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  style={{
                    padding: isMobile ? '12px' : '16px',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    background: currentChatId === chat.id 
                      ? 'linear-gradient(135deg, rgba(22, 160, 133, 0.2) 0%, rgba(19, 141, 117, 0.1) 100%)'
                      : 'transparent',
                    cursor: 'pointer',
                    fontWeight: currentChatId === chat.id ? '600' : '500',
                    color: currentChatId === chat.id ? '#16a085' : '#bdc3c7',
                    transition: 'all 0.3s ease',
                    border: currentChatId === chat.id ? '1px solid rgba(22, 160, 133, 0.3)' : '1px solid transparent'
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
                    fontSize: isMobile ? '13px' : '15px'
                  }}>
                    {chat.titulo}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    marginTop: '4px'
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
            minHeight: isMobile ? 'calc(100vh - 380px)' : 'auto'
          }}>
            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: isMobile ? '16px' : '32px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              background: 'linear-gradient(180deg, #f8fdfa 0%, #ecf9f5 100%)',
              minHeight: isMobile ? '300px' : '400px'
            }}>
              {messages.length === 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(22, 160, 133, 0.4)',
                    flexShrink: 0
                  }}>
                    <Bot color="#ffffff" size={22} />
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    maxWidth: '70%',
                    border: '1px solid rgba(22, 160, 133, 0.1)',
                    fontSize: '15px',
                    lineHeight: '1.5',
                    color: '#2c3e50'
                  }}>
                    ¡Hola! Soy tu asistente virtual universitario. ¿En qué puedo ayudarte hoy?
                  </div>
                </div>
              )}
              
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <div style={{
                    background: msg.rol === 'usuario' 
                      ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                      : 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: msg.rol === 'usuario' ? '2px solid #16a085' : 'none',
                    boxShadow: msg.rol === 'usuario' 
                      ? '0 4px 15px rgba(22, 160, 133, 0.2)'
                      : '0 4px 15px rgba(22, 160, 133, 0.4)',
                    flexShrink: 0
                  }}>
                    {msg.rol === 'usuario' ? 
                      <User color="#16a085" size={22} /> : 
                      <Bot color="#ffffff" size={22} />
                    }
                  </div>
                  <div style={{
                    background: msg.rol === 'usuario' 
                      ? 'linear-gradient(135deg, #e8f8f5 0%, #d5f4e6 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    maxWidth: isMobile ? '85%' : '70%',
                    border: '1px solid rgba(22, 160, 133, 0.1)',
                    fontSize: '15px',
                    lineHeight: '1.5',
                    wordBreak: 'break-word',
                    color: '#2c3e50'
                  }}>
                    {msg.contenido}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(22, 160, 133, 0.4)',
                    flexShrink: 0
                  }}>
                    <Bot color="#ffffff" size={22} />
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(22, 160, 133, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#7f8c8d', fontSize: '14px' }}>Escribiendo</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#16a085',
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
              padding: isMobile ? '16px 20px' : '24px 32px',
              borderTop: '1px solid rgba(22, 160, 133, 0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{
                display: 'flex',
                gap: '16px',
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
                    padding: '16px 20px',
                    fontSize: '15px',
                    minHeight: '52px',
                    maxHeight: '120px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: '#ffffff',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                    color: '#2c3e50',
                    lineHeight: '1.4'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16a085';
                    e.target.style.boxShadow = '0 4px 20px rgba(22, 160, 133, 0.15)';
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
                      : 'linear-gradient(135deg, #16a085 0%, #138d75 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    fontWeight: '600',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (!message.trim() || isTyping) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: (!message.trim() || isTyping) 
                      ? '0 2px 8px rgba(149, 165, 166, 0.3)' 
                      : '0 4px 15px rgba(22, 160, 133, 0.3)',
                    minWidth: '60px',
                    height: '52px'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #16a085 0%, #138d75 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Send size={20} />
                </button>
              </div>
              {error && (
                <div style={{
                  color: '#e74c3c',
                  marginTop: '12px',
                  padding: '12px 16px',
                  background: 'rgba(231, 76, 60, 0.1)',
                  border: '1px solid rgba(231, 76, 60, 0.3)',
                  borderRadius: '12px',
                  fontSize: '14px'
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
            background: rgba(22, 160, 133, 0.1);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #16a085 0%, #138d75 100%);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
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
            .messages-container {
              padding: 12px !important;
            }
            
            .message-content {
              max-width: 90% !important;
              padding: 12px 16px !important;
              font-size: 14px !important;
            }
            
            .input-area {
              padding: 12px 16px !important;
            }
            
            .textarea-input {
              padding: 12px 16px !important;
              font-size: 14px !important;
            }
          }
          
          /* Asegurar que los elementos clickeables tengan suficiente área en móviles */
          @media (max-width: 768px) {
            button {
              min-height: 44px;
            }
            
            .chat-item {
              min-height: 44px;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
          }
          
          /* Mejorar la legibilidad en modo oscuro del sistema */
          @media (prefers-color-scheme: dark) {
            textarea {
              background: #ffffff !important;
              color: #2c3e50 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Chat;