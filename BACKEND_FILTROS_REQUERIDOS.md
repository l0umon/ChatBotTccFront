# 🚨 BACKEND - Implementación Requerida para Filtros de Tickets

## ❌ Problema Actual
El endpoint `GET /api/tickets/mis-tickets` está devolviendo SOLO los tickets del usuario autenticado, ignorando los parámetros de filtrado por rol.

## ✅ Solución Requerida

### Endpoint: `GET /api/tickets/mis-tickets`

El backend debe implementar esta lógica exacta en el controlador:

```javascript
// Pseudocódigo para el backend
async function getMisTickets(req, res) {
  const { ind_alumno, admin_todos, estado, categoria, prioridad, limit = 100, offset = 0 } = req.query;
  const usuarioAutenticado = req.user; // Del token JWT
  
  let whereCondition = {};
  
  // LÓGICA SEGÚN ROL DEL USUARIO AUTENTICADO
  if (usuarioAutenticado.rol === 'administrador') {
    console.log('👑 Usuario administrador detectado');
    
    if (admin_todos === 'true') {
      // Administrador quiere TODOS los tickets del sistema
      console.log('🌐 Admin solicitó TODOS los tickets del sistema');
      // whereCondition queda vacío = todos los tickets
      
    } else if (ind_alumno === 'S') {
      // Solo tickets donde el creador es alumno
      whereCondition['usuario.rol'] = 'alumno';
      console.log('📚 Admin solicitó solo tickets de alumnos');
      
    } else if (ind_alumno === 'N') {
      // Solo tickets donde el creador es personal
      whereCondition['usuario.rol'] = 'personal';
      console.log('👥 Admin solicitó solo tickets de personal');
      
    } else {
      // Sin parámetros específicos: devolver todos (comportamiento por defecto para admin)
      console.log('🌐 Admin sin filtro específico - devolviendo todos por defecto');
    }
    
  } else if (usuarioAutenticado.rol === 'personal') {
    console.log('👔 Usuario personal detectado');
    
    const tienePermisosAlumnos = usuarioAutenticado.tickets_alumnos === 'S';
    const tienePermisosPersonal = usuarioAutenticado.tickets_personal === 'S';
    
    if (ind_alumno === 'S' && tienePermisosAlumnos) {
      // Solo tickets de alumnos (si tiene permisos)
      whereCondition = {
        'usuario.rol': 'alumno'
      };
      console.log('📚 Personal autorizado para ver tickets de alumnos');
      
    } else if (ind_alumno === 'N' && tienePermisosPersonal) {
      // Solo tickets de personal (si tiene permisos)
      whereCondition = {
        'usuario.rol': 'personal'
      };
      console.log('👥 Personal autorizado para ver tickets de personal');
      
    } else if (!ind_alumno && (tienePermisosAlumnos || tienePermisosPersonal)) {
      // Sin filtro específico pero con permisos
      const rolesPermitidos = [];
      if (tienePermisosAlumnos) rolesPermitidos.push('alumno');
      if (tienePermisosPersonal) rolesPermitidos.push('personal');
      
      whereCondition = {
        'usuario.rol': { $in: rolesPermitidos }
      };
      console.log('🔄 Personal con permisos - mostrando según permisos');
      
    } else {
      // Sin permisos específicos: solo tickets propios
      whereCondition = {
        usuario_id: usuarioAutenticado.id
      };
      console.log('👤 Personal sin permisos - solo tickets propios');
    }
    
  } else {
    // Alumno: SIEMPRE solo sus propios tickets
    whereCondition = {
      usuario_id: usuarioAutenticado.id
    };
    console.log('🎓 Alumno - solo tickets propios');
  }
  
  // APLICAR FILTROS ADICIONALES
  if (estado) {
    whereCondition.estado = estado;
  }
  
  if (categoria) {
    whereCondition.categoria = categoria;
  }
  
  if (prioridad) {
    whereCondition.prioridad = prioridad;
  }
  
  // EJECUTAR CONSULTA
  const tickets = await Ticket.find(whereCondition)
    .populate('usuario', 'id nombre apellido email rol')
    .populate('usuario_asignado', 'id nombre apellido email')
    .limit(parseInt(limit))
    .skip(parseInt(offset))
    .sort({ fecha_creacion: -1 });
    
  console.log(`📊 Devolviendo ${tickets.length} tickets con filtro:`, whereCondition);
  
  return res.json({
    success: true,
    data: tickets,
    filtros: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: tickets.length,
      aplicado: whereCondition
    }
  });
}
```

## 🔍 Verificación

Después de implementar, estos endpoints deben funcionar así:

### Para Administrador:
- `GET /api/tickets/mis-tickets?admin_todos=true` → TODOS los tickets del sistema
- `GET /api/tickets/mis-tickets?ind_alumno=S` → Solo tickets creados por alumnos
- `GET /api/tickets/mis-tickets?ind_alumno=N` → Solo tickets creados por personal
- `GET /api/tickets/mis-tickets?ind_alumno=S&estado=abierto` → Tickets abiertos de alumnos

### Para Personal con permisos:
- `GET /api/tickets/mis-tickets?ind_alumno=S` → Tickets de alumnos (si tiene permiso)
- `GET /api/tickets/mis-tickets?ind_alumno=N` → Tickets de personal (si tiene permiso)

### Para Alumno:
- `GET /api/tickets/mis-tickets` → Solo SUS tickets (ignorar parámetros)

## 📋 Checklist para Backend

- [ ] ✅ El endpoint lee correctamente los parámetros `admin_todos`, `ind_alumno`, `estado`, `categoria`, `prioridad`
- [ ] ✅ Detecta el rol del usuario autenticado desde el token
- [ ] ✅ Implementa la lógica de filtrado según rol y permisos
- [ ] ✅ Para administradores: respeta los parámetros de filtrado (sin ind_alumno = todos)
- [ ] ✅ Para personal: verifica permisos `tickets_alumnos` y `tickets_personal`
- [ ] ✅ Para alumnos: ignora parámetros y devuelve solo sus tickets
- [ ] ✅ Incluye los datos del usuario que creó cada ticket
- [ ] ✅ Soporta paginación con `limit` y `offset`
- [ ] ✅ Logs de debug para verificar que funciona

## 🧪 Testing

Usa el archivo `test-endpoints.html` incluido para probar cada escenario después de la implementación.