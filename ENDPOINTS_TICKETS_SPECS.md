# Especificaciones de Endpoints para Tickets

## 🎯 Endpoints Principales Requeridos

### 1. **GET /api/tickets/mis-tickets**
**Función:** Obtener tickets según permisos del usuario
**Headers requeridos:** `Authorization: Bearer <token>`

#### Parámetros Query:
- `all=true` - Para administradores: ver todos los tickets del sistema
- `ind_alumno=S` - Filtrar solo tickets de alumnos
- `ind_alumno=N` - Filtrar solo tickets de personal
- `limit=100` - Limitar cantidad de resultados
- `offset=0` - Paginación

#### Lógica de negocio:
```
if usuario.rol == 'administrador':
    if all=true: devolver todos los tickets
    if ind_alumno=S: devolver tickets donde usuario.rol='alumno'
    if ind_alumno=N: devolver tickets donde usuario.rol='personal'
    else: devolver todos los tickets
elif usuario.rol == 'personal':
    if tiene permiso tickets_alumnos='S': incluir tickets de alumnos
    if tiene permiso tickets_personal='S': incluir tickets de personal
    else: solo tickets propios
elif usuario.rol == 'alumno':
    devolver solo tickets propios (usuario_id = token.user_id)
```

#### Respuesta esperada:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Problema con login",
      "descripcion": "No puedo acceder...",
      "categoria": "tecnico",
      "prioridad": "alta",
      "estado": "abierto",
      "fecha_creacion": "2024-10-09T10:30:00Z",
      "fecha_actualizacion": "2024-10-09T10:30:00Z",
      "chat_id": 123,
      "usuario": {
        "id": 5,
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@email.com",
        "username": "jperez"
      },
      "usuario_asignado": {
        "id": 2,
        "nombre": "María",
        "apellido": "González",
        "email": "maria@email.com"
      },
      "respuesta_admin": "Revisando el problema...",
      "admin_respuesta": {
        "id": 2,
        "nombre": "María",
        "apellido": "González"
      }
    }
  ],
  "filtros": {
    "limit": 100,
    "offset": 0,
    "total": 1
  }
}
```

### 2. **POST /api/tickets**
**Función:** Crear nuevo ticket
**Headers:** `Authorization: Bearer <token>`

#### Body:
```json
{
  "titulo": "Título del ticket",
  "descripcion": "Descripción detallada",
  "categoria": "tecnico|academico|general",
  "prioridad": "baja|media|alta|critica",
  "chat_id": 123
}
```

#### Respuesta:
```json
{
  "success": true,
  "data": {
    "id": 5,
    "titulo": "...",
    "estado": "abierto",
    "usuario_id": "token.user_id",
    "fecha_creacion": "2024-10-09T10:30:00Z"
  }
}
```

### 3. **PUT /api/tickets/:id**
**Función:** Actualizar ticket (solo admins y personal con permisos)
**Headers:** `Authorization: Bearer <token>`

#### Body:
```json
{
  "estado": "abierto|en_proceso|resuelto|cerrado",
  "usuario_asignado_id": 2,
  "respuesta_admin": "Respuesta del administrador",
  "prioridad": "baja|media|alta|critica"
}
```

### 4. **GET /api/admin/users**
**Función:** Obtener usuarios asignables (personal y administradores activos)
**Solo para administradores**

#### Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "nombre": "María",
      "apellido": "González",
      "email": "maria@email.com",
      "rol": "personal",
      "activo": true,
      "tickets_alumnos": "S",
      "tickets_personal": "S"
    }
  ]
}
```

## 🔐 Control de Acceso

### Permisos por Rol:
1. **Administrador:**
   - Ver todos los tickets
   - Crear, editar, asignar cualquier ticket
   - Cambiar estados de tickets

2. **Personal:**
   - Ver tickets según permisos:
     - `tickets_alumnos='S'` → puede ver/gestionar tickets de alumnos
     - `tickets_personal='S'` → puede ver/gestionar tickets de personal
   - Crear tickets propios
   - Editar tickets asignados

3. **Alumno:**
   - Solo ver sus propios tickets
   - Crear tickets
   - No puede asignar ni cambiar estados

## 📊 Estados de Tickets
- `abierto` - Recién creado, sin asignar
- `en_proceso` - Asignado y en trabajo
- `resuelto` - Solucionado, pendiente cierre
- `cerrado` - Finalizado completamente

## 🏷️ Categorías
- `tecnico` - Problemas técnicos del sistema
- `academico` - Consultas académicas/administrativas
- `general` - Otros temas

## ⚡ Prioridades
- `baja` - No urgente
- `media` - Normal
- `alta` - Requiere atención pronto
- `critica` - Urgente, alta prioridad

## 🔍 Endpoints de Fallback (Opcionales)
Si necesitas endpoints adicionales para compatibilidad:

- `GET /api/tickets` - Alias de mis-tickets
- `GET /api/tickets/all` - Para administradores (todos los tickets)
- `GET /api/admin/tickets` - Vista administrativa completa

## 🚨 Casos de Error

### 401 Unauthorized:
```json
{
  "success": false,
  "error": "TOKEN_MISSING",
  "message": "Token de autenticación requerido"
}
```

### 403 Forbidden:
```json
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSIONS", 
  "message": "Sin permisos para esta operación"
}
```

### 404 Not Found:
```json
{
  "success": false,
  "error": "TICKET_NOT_FOUND",
  "message": "Ticket no encontrado"
}
```

## 📝 Notas de Implementación

1. **Filtros automáticos:** El backend debe aplicar filtros automáticamente según el rol del usuario autenticado
2. **Paginación:** Implementar limit/offset para grandes cantidades de tickets
3. **Validación:** Validar que solo usuarios con permisos puedan ver/editar tickets específicos
4. **Auditoría:** Registrar cambios de estado y asignaciones para trazabilidad