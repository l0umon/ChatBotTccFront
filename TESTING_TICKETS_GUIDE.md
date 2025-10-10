# 🧪 Guía de Pruebas - Sistema de Tickets Frontend

## 📋 Validación Completa del Sistema

### ✅ **Funciones de Testing Implementadas**

El sistema ahora incluye funciones de testing disponibles en la consola del navegador:

#### **Funciones Disponibles**
```javascript
// Ejecuta todas las pruebas automáticamente
testearTickets()

// Obtiene tickets con filtros personalizados
obtenerMisTickets({
  estado: 'abierto',
  categoria: 'problema_tecnico',
  limit: 10,
  offset: 0
})

// Obtiene resumen de tickets (si está implementado)
obtenerResumenMisTickets(10, 0)
```

### 🔍 **Pasos para Probar el Sistema**

#### **1. Preparación**
1. Asegúrate de estar logueado en la aplicación
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña "Console"

#### **2. Ejecutar Pruebas Automáticas**
```javascript
// En la consola del navegador:
testearTickets()
```

**Esto probará:**
- ✅ Verificación del token de autenticación
- ✅ Obtención de todos los tickets del usuario
- ✅ Filtros por estado ("abierto")
- ✅ Filtros por categoría ("problema_tecnico")
- ✅ Paginación (limit=5, offset=0)
- ✅ Endpoint de resumen (si existe)

#### **3. Pruebas Específicas**

##### **Obtener todos los tickets:**
```javascript
obtenerMisTickets()
```

##### **Filtrar por estado:**
```javascript
obtenerMisTickets({ estado: 'abierto' })
obtenerMisTickets({ estado: 'en_proceso' })
obtenerMisTickets({ estado: 'resuelto' })
obtenerMisTickets({ estado: 'cerrado' })
```

##### **Filtrar por categoría:**
```javascript
obtenerMisTickets({ categoria: 'consulta' })
obtenerMisTickets({ categoria: 'problema_tecnico' })
obtenerMisTickets({ categoria: 'sugerencia' })
obtenerMisTickets({ categoria: 'queja' })
obtenerMisTickets({ categoria: 'otro' })
```

##### **Pruebas de paginación:**
```javascript
obtenerMisTickets({ limit: 5, offset: 0 })  // Primera página
obtenerMisTickets({ limit: 5, offset: 5 })   // Segunda página
obtenerMisTickets({ limit: 5, offset: 10 })  // Tercera página
```

##### **Combinaciones de filtros:**
```javascript
obtenerMisTickets({ 
  estado: 'abierto', 
  categoria: 'problema_tecnico',
  limit: 3 
})
```

#### **4. Probar Modal de Campanita**

1. **Abrir el modal:**
   - Haz clic en la campanita (🔔) en el header
   - Debería abrirse el modal con la lista de tickets

2. **Probar funcionalidades del modal:**
   - **Búsqueda:** Escribe en el campo de búsqueda
   - **Filtros:** Cambia el filtro de estado
   - **Actualizar:** Haz clic en el botón "Actualizar"
   - **Detalles:** Haz clic en un ticket para ver detalles
   - **Cerrar:** Usa el botón X o haz clic fuera del modal

3. **Verificar datos mostrados:**
   - ID del ticket
   - Título y descripción
   - Estado con iconos y colores
   - Fechas de creación y actualización
   - Respuestas del administrador (si existen)

### 🔧 **Resolución de Problemas**

#### **Error 401 - No autorizado**
```
❌ Error de autenticación. El token puede haber expirado.
```
**Solución:** Cierra sesión y vuelve a iniciar sesión.

#### **Error de conexión**
```
❌ Error obteniendo tickets: Network Error
```
**Solución:** Verifica que el backend esté ejecutándose.

#### **No se encuentran funciones**
```
testearTickets is not defined
```
**Solución:** Recarga la página para cargar las funciones globales.

#### **Tickets no se cargan en el modal**
1. Abre la consola y ejecuta: `testearTickets()`
2. Si las pruebas fallan, revisa los errores mostrados
3. Verifica que el backend esté respondiendo correctamente

### 📊 **Respuesta Esperada del Backend**

#### **Estructura de respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "titulo": "Problema con el sistema",
        "descripcion": "Descripción detallada...",
        "categoria": "problema_tecnico",
        "prioridad": "alta",
        "estado": "abierto",
        "fecha_creacion": "2024-01-01T10:00:00Z",
        "fecha_actualizacion": "2024-01-01T10:00:00Z",
        "respuesta_admin": null,
        "admin_respuesta": null
      }
    ],
    "total": 1
  }
}
```

### ✅ **Checklist de Validación**

#### **Backend:**
- [ ] Endpoint `/api/tickets/mis-tickets` funcionando
- [ ] Autenticación JWT validando `req.user.userId`
- [ ] Filtros por estado y categoría funcionando
- [ ] Paginación con limit/offset funcionando
- [ ] Estructura de respuesta correcta

#### **Frontend:**
- [ ] Campanita visible en el header
- [ ] Modal se abre al hacer clic en campanita
- [ ] Lista de tickets se carga correctamente
- [ ] Filtros funcionan en tiempo real
- [ ] Panel de detalles muestra información completa
- [ ] Funciones de testing disponibles en consola
- [ ] Token JWT se envía automáticamente

### 🎯 **Casos de Prueba Críticos**

1. **Usuario sin tickets:** Modal muestra mensaje vacío
2. **Usuario con muchos tickets:** Paginación funciona correctamente
3. **Tickets con respuesta admin:** Se muestran destacados en verde
4. **Diferentes estados:** Iconos y colores correctos
5. **Búsqueda:** Filtra por título y descripción
6. **Responsive:** Funciona en móvil y desktop

### 📝 **Notas de Desarrollo**

- Las funciones de testing solo están disponibles en el navegador
- El token JWT se incluye automáticamente en todas las peticiones
- Los filtros se aplican tanto en frontend como backend
- El modal mantiene el estado de filtros durante la sesión
- La paginación se resetea al cambiar filtros

---

**💡 Tip:** Usa `testearTickets()` como primera prueba para validar que todo el sistema funciona correctamente.