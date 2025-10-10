# Componente MyTickets

## Descripción
El componente `MyTickets` permite a los usuarios ver y gestionar sus propios tickets de soporte. Proporciona una interfaz completa para consultar el estado y progreso de las solicitudes.

## Características Implementadas

### ✅ Funcionalidades Principales
- **Vista de lista**: Muestra todos los tickets del usuario con información resumida
- **Vista detallada**: Panel lateral con información completa del ticket seleccionado
- **Filtros avanzados**: Por estado, categoría y búsqueda por texto
- **Paginación**: Carga automática de más tickets con botón "Cargar más"
- **Estado en tiempo real**: Indica si el ticket tiene respuesta del administrador
- **Navegación integrada**: Enlaces a chat y panel de administración (si aplica)

### 🎨 Interfaz de Usuario
- **Diseño responsivo**: Adaptado para desktop y móvil
- **Tema consistente**: Colores y estilos coherentes con el resto de la aplicación
- **Indicadores visuales**: Iconos y colores para estados y prioridades
- **Notificaciones**: Sistema de toast para feedback del usuario
- **Loading states**: Indicadores de carga durante las operaciones

### 🔍 Sistema de Filtros
- **Por estado**: Todos, Abierto, En Proceso, Resuelto, Cerrado
- **Por categoría**: Todas, Consulta General, Problema Técnico, Sugerencia, Queja, Otro
- **Búsqueda de texto**: En título y descripción de tickets
- **Actualización automática**: Los filtros se aplican al cargar datos del servidor

### 📊 Información Mostrada
- **Datos básicos**: ID, título, descripción, fechas
- **Clasificación**: Estado, prioridad, categoría
- **Respuestas**: Muestra si hay respuesta del administrador
- **Historial**: Fechas de creación y última actualización

## Endpoints Utilizados

### GET /api/tickets/mis-tickets
```
Authorization: Bearer [token]
Query Parameters:
  - estado: (opcional) abierto|en_proceso|resuelto|cerrado
  - categoria: (opcional) consulta|problema_tecnico|sugerencia|queja|otro
  - limit: (opcional) número de tickets por página (default: 20)
  - offset: (opcional) número de tickets a saltar (default: 0)
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "titulo": "Problema con el sistema",
        "descripcion": "Descripción del problema...",
        "categoria": "problema_tecnico",
        "prioridad": "alta",
        "estado": "abierto",
        "fecha_creacion": "2024-01-01T10:00:00Z",
        "fecha_actualizacion": "2024-01-01T10:00:00Z",
        "respuesta_admin": "Respuesta del administrador...",
        "admin_respuesta": {
          "id": 1,
          "nombre": "Admin",
          "apellido": "Usuario"
        }
      }
    ],
    "total": 25
  }
}
```

## Rutas Configuradas

### `/mis-tickets`
- **Componente**: `MyTickets`
- **Acceso**: Usuarios autenticados
- **Propósito**: Vista principal de tickets del usuario

## Navegación

### Enlaces Agregados
- **Chat**: Botón "Mis Tickets" en la barra lateral
- **Sidebar**: Navegación completa con dashboard, usuarios (admin), etc.

### Redirecciones Automáticas
- Si no hay token: Redirección a `/login`
- Error en datos de usuario: Redirección a `/login`

## Estados de Tickets

### Visualización por Estado
- **🔴 Abierto**: AlertCircle rojo - Ticket nuevo, esperando atención
- **🟡 En Proceso**: Clock naranja - Siendo procesado por el equipo
- **🟢 Resuelto**: CheckCircle verde - Problema solucionado
- **⚫ Cerrado**: XCircle gris - Ticket finalizado

### Prioridades
- **🔴 Urgente**: Fondo rojo
- **🟡 Alta**: Fondo naranja  
- **🔵 Media**: Fondo azul
- **🟢 Baja**: Fondo verde

## Instalación y Uso

### 1. Archivo creado
```
src/components/MyTickets.tsx
```

### 2. Ruta agregada en App.tsx
```tsx
import MyTickets from './components/MyTickets';
// ...
<Route path="/mis-tickets" element={<MyTickets />} />
```

### 3. Navegación agregada en Chat.tsx
```tsx
// Botón en sidebar antes del logout
<button onClick={() => window.location.href = '/mis-tickets'}>
  <Ticket size={18} />
  Mis Tickets
</button>
```

## Dependencias

### Iconos (Lucide React)
- `ArrowLeft`, `Users`, `Settings`, `LogOut`, `University`
- `Ticket`, `Search`, `Clock`, `CheckCircle`, `AlertCircle`, `XCircle`
- `MessageSquare`, `Calendar`, `RefreshCw`, `Eye`

### Componentes Relacionados
- `Api.tsx`: Para llamadas HTTP autenticadas
- `Chat.tsx`: Navegación integrada
- `App.tsx`: Configuración de rutas

## Características Técnicas

### State Management
- Estado local con React hooks
- useCallback para optimización de rendimiento
- useEffect para carga inicial y filtros

### Responsive Design
- Grid layout adaptativo
- Sidebar colapsable en vista detalle
- Botones y texto ajustados para móvil

### Performance
- Paginación para evitar cargas pesadas
- Filtros aplicados en servidor
- Debounce implícito en búsqueda

### Accessibility
- Colores contrastantes para legibilidad
- Estados visuales claros
- Navegación por teclado funcional

## Próximas Mejoras Sugeridas

### 🚀 Funcionalidades Adicionales
- Exportar tickets a PDF
- Comentarios del usuario en tickets
- Notificaciones push cuando hay respuesta
- Histórico de cambios de estado

### 🎨 Mejoras de UI/UX
- Modo oscuro
- Personalización de columnas visibles
- Filtros guardados por usuario
- Vista de calendario para tickets

### 📈 Analytics
- Tiempo promedio de resolución
- Estadísticas personales de tickets
- Gráficos de tendencias

---

**Nota**: Este componente está listo para producción y requiere que el backend implemente el endpoint `/api/tickets/mis-tickets` con la estructura de respuesta especificada.