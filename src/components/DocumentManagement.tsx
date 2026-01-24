import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  MessageSquare,
  Shield,
  ArrowRight,
  GraduationCap,
  Download,
  Edit2,
  Trash2
} from 'lucide-react';
import Api from './Api';interface Documento {
	id: number;
	titulo: string;
	descripcion: string;
	categoria: string;
	rolAcceso: string;
	fileName: string;
	fechaSubida: string;
	tamaño: string;
}

const categorias = [
	{ value: '', label: 'Selecciona una categoría' },
	{ value: 'academico', label: 'Académico' },
	{ value: 'administrativo', label: 'Administrativo' },
	{ value: 'reglamento', label: 'Reglamento' },
	{ value: 'guia', label: 'Guía' },
	{ value: 'otro', label: 'Otro' },
];

const roles = [
	{ value: '', label: 'Selecciona el nivel de acceso' },
	{ value: 'estudiante', label: 'Estudiantes' },
	{ value: 'personal', label: 'Personal' },
];

const DocumentManagement: React.FC = () => {
	const [titulo, setTitulo] = useState('');
	const [descripcion, setDescripcion] = useState('');
	const [categoria, setCategoria] = useState('');
	const [rolAcceso, setRolAcceso] = useState('');
	const [file, setFile] = useState<File | null>(null);
	const [search, setSearch] = useState('');
	const [filterCategoria, setFilterCategoria] = useState('');
	const [showUploadForm, setShowUploadForm] = useState(false);

	// Estado para ver documento
	const [docActual, setDocActual] = useState<Documento | null>(null);
	const [modoVista, setModoVista] = useState<'subir' | 'ver' | 'editar'>('subir');
	
	// Estado para edición
	const [documentoEditando, setDocumentoEditando] = useState<Documento | null>(null);
	const [isEditing, setIsEditing] = useState(false);

	// Estados para notificaciones y confirmación
	const [notification, setNotification] = useState<{
		show: boolean;
		message: string;
		type: 'success' | 'error' | 'info';
	}>({ show: false, message: '', type: 'info' });
	const [confirmDialog, setConfirmDialog] = useState<{
		show: boolean;
		message: string;
		onConfirm: () => void;
		onCancel: () => void;
	}>({ show: false, message: '', onConfirm: () => {}, onCancel: () => {} });

	// Función para mostrar notificaciones
	const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
		setNotification({ show: true, message, type });
		setTimeout(() => {
			setNotification(prev => ({ ...prev, show: false }));
		}, 4000);
	};

	// Función para mostrar diálogo de confirmación
	const showConfirmDialog = (message: string, onConfirm: () => void) => {
		setConfirmDialog({
			show: true,
			message,
			onConfirm: () => {
				setConfirmDialog(prev => ({ ...prev, show: false }));
				onConfirm();
			},
			onCancel: () => setConfirmDialog(prev => ({ ...prev, show: false }))
		});
	};

	// Función para forzar estilos via JavaScript
	useEffect(() => {
		const forceStyles = () => {
			const inputs = document.querySelectorAll('.form-input-override, .form-select-override, .form-textarea-override, .form-file-override');
			inputs.forEach(input => {
				if (input instanceof HTMLElement) {
					input.style.setProperty('background-color', '#f3f4f6', 'important');
					input.style.setProperty('color', '#1f2937', 'important');
					input.style.setProperty('border', '2px solid #d1d5db', 'important');
					input.style.setProperty('color-scheme', 'none', 'important');
				}
			});
		};

		if (showUploadForm) {
			// Forzar estilos inmediatamente y después de un pequeño delay
			setTimeout(forceStyles, 0);
			setTimeout(forceStyles, 100);
			setTimeout(forceStyles, 500);
		}
	}, [showUploadForm]);

	// Datos de ejemplo
	const [documentos, setDocumentos] = useState<Documento[]>([
		{
			id: 1,
			titulo: 'Reglamento Académico 2024',
			descripcion: 'Normativas y procedimientos académicos actualizados',
			categoria: 'reglamento',
			rolAcceso: 'todos',
			fileName: 'reglamento-academico-2024.pdf',
			fechaSubida: '2024-01-15',
			tamaño: '2.3 MB'
		},
		{
			id: 2,
			titulo: 'Guía de Inscripción',
			descripcion: 'Manual paso a paso para el proceso de inscripción',
			categoria: 'guia',
			rolAcceso: 'estudiante',
			fileName: 'guia-inscripcion.pdf',
			fechaSubida: '2024-02-01',
			tamaño: '1.8 MB'
		}
	]);

	// Cargar documentos desde el backend
	useEffect(() => {
		const cargarDocumentos = async () => {
			try {
				const token = localStorage.getItem('authToken');
				const res = await fetch('/api/documents?limit=100&offset=0', {
					method: 'GET',
					headers: {
						...(token ? { 'Authorization': `Bearer ${token}` } : {}),
						'Content-Type': 'application/json'
					}
				});
				const data = await res.json();
				console.log('📄 Respuesta completa de documentos:', data);
				
				if (res.ok && data.documentos && Array.isArray(data.documentos)) {
					console.log('📋 Documentos recibidos:', data.documentos);
					if (data.documentos.length > 0) {
						console.log('🔍 Estructura del primer documento:', JSON.stringify(data.documentos[0], null, 2));
					}
					
					// Mapear los datos del backend a la estructura esperada
					const documentosMapeados = data.documentos.map((doc: Record<string, unknown>) => {
						console.log('🔍 Mapeando documento individual:', doc);
						console.log('📝 Descripción original:', doc.descripcion, doc.description);
						console.log('🔐 Rol acceso original:', doc.rol_acceso, doc.roleAccess, doc.rolAcceso);
						
						const mapped = {
							id: doc.id,
							titulo: doc.titulo || doc.title || 'Sin título',
							descripcion: doc.descripcion || doc.description || 'Sin descripción disponible',
							categoria: doc.categoria || doc.category || 'otro',
							rolAcceso: doc.rol_acceso || doc.roleAccess || doc.rolAcceso || 'estudiante',
							fileName: doc.nombre_archivo || doc.filename || doc.fileName || 'documento.pdf',
							fechaSubida: doc.fecha_creacion || doc.createdAt || doc.fechaSubida || new Date().toISOString().split('T')[0],
							tamaño: doc.tamaño || doc.size || '0 KB'
						};
						
						console.log('✅ Documento mapeado:', mapped);
						return mapped;
					});
					
					console.log('✅ Documentos mapeados:', documentosMapeados);
					setDocumentos(documentosMapeados);
				} else {
					console.error('Error al obtener documentos:', data);
				}
			} catch (err) {
				console.error('Error al obtener documentos:', err);
			}
		};
		cargarDocumentos();
	}, [showUploadForm]);

	const isMobile = window.innerWidth <= 768;

	// Función para descargar documento (igual que en Chat.tsx)
	const descargarDocumento = async (documentoId: number, nombreArchivo: string, fuenteOriginal?: string) => {
		try {
			console.log(`📥 Descargando documento ${documentoId}...`);
			
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
			showNotification(`Documento "${nombreArchivo}" descargado exitosamente`, 'success');
			
		} catch (error) {
			console.error('❌ Error descargando:', error);
			showNotification(`Error al descargar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!titulo || !categoria || !rolAcceso || !file) return;

		const formData = new FormData();
	formData.append('documento', file);
	formData.append('titulo', titulo);
	formData.append('descripcion', descripcion);
		formData.append('categoria', categoria);
		formData.append('rol_acceso', rolAcceso);

		try {
			const token = localStorage.getItem('authToken');
			const res = await fetch('/api/documents/upload', {
				method: 'POST',
				body: formData,
				headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
			});
			const data = await res.json();
			if (res.ok) {
				// Opcional: agregar el documento subido a la lista local
				setDocumentos([
					...documentos,
					{
						id: Date.now(),
						titulo,
						descripcion,
						categoria,
						rolAcceso,
						fileName: file.name,
						fechaSubida: new Date().toISOString().split('T')[0],
						tamaño: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
					}
				]);
				setTitulo('');
				setDescripcion('');
				setCategoria('');
				setRolAcceso('');
				setFile(null);
				setShowUploadForm(false);
				// Notificación de éxito
				showNotification('Documento subido correctamente', 'success');
			} else {
				showNotification('Error al subir el documento: ' + (data?.message || 'Error desconocido'), 'error');
			}
		} catch (error) {
			showNotification('Error de red al subir el documento: ' + (error instanceof Error ? error.message : ''), 'error');
		}
	};

	// Función para actualizar un documento existente
	const handleUpdateDocument = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!documentoEditando || !titulo || !categoria || !rolAcceso) return;

		try {
			const token = localStorage.getItem('authToken');
			const updateData = {
				titulo,
				descripcion,
				categoria,
				rol_acceso: rolAcceso
			};

			const res = await fetch(`/api/documents/${documentoEditando.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...(token ? { 'Authorization': `Bearer ${token}` } : {})
				},
				body: JSON.stringify(updateData)
			});

			const data = await res.json();
			
			if (res.ok) {
				// Actualizar el documento en la lista local
				setDocumentos(prevDocs => 
					prevDocs.map(doc => 
						doc.id === documentoEditando.id 
							? { ...doc, titulo, descripcion, categoria, rolAcceso }
							: doc
					)
				);
				
				// Limpiar estado de edición
				setDocumentoEditando(null);
				setIsEditing(false);
				setModoVista('subir');
				setTitulo('');
				setDescripcion('');
				setCategoria('');
				setRolAcceso('');
				
				showNotification('Documento actualizado correctamente', 'success');
			} else {
				showNotification('Error al actualizar el documento: ' + (data?.message || 'Error desconocido'), 'error');
			}
		} catch (error) {
			showNotification('Error de red al actualizar el documento: ' + (error instanceof Error ? error.message : ''), 'error');
		}
	};

	// Función para iniciar edición de documento
	const startEditDocument = (documento: Documento) => {
		console.log('✏️ Iniciando edición de documento:', documento);
		console.log('📝 Descripción del documento:', documento.descripcion);
		console.log('🔐 Rol de acceso:', documento.rolAcceso);
		
		setDocumentoEditando(documento);
		setTitulo(documento.titulo);
		// Si la descripción es "Sin descripción disponible", limpiarla para edición
		setDescripcion(documento.descripcion === 'Sin descripción disponible' ? '' : documento.descripcion);
		setCategoria(documento.categoria);
		setRolAcceso(documento.rolAcceso);
		setIsEditing(true);
		setModoVista('editar');
		setShowUploadForm(true);
	};

	// Función para cancelar edición
	const cancelEdit = () => {
		setDocumentoEditando(null);
		setIsEditing(false);
		setModoVista('subir');
		setTitulo('');
		setDescripcion('');
		setCategoria('');
		setRolAcceso('');
		setFile(null);
		setShowUploadForm(false);
	};

	const filteredDocs = documentos.filter(doc => {
		// Filtro por categoría
		const matchesCategory = filterCategoria ? doc.categoria === filterCategoria : true;
		
		// Filtro de búsqueda mejorado: busca en título, descripción y autor
		let matchesSearch = true;
		if (search) {
			const searchTerm = search.toLowerCase();
			const titulo = doc.titulo?.toLowerCase() || '';
			const descripcion = doc.descripcion?.toLowerCase() || '';
			// Asumiendo que el autor estará disponible cuando el backend lo provea
			const autor = ''; // doc.autor?.toLowerCase() || '';
			
			matchesSearch = titulo.includes(searchTerm) || 
			               descripcion.includes(searchTerm) || 
			               autor.includes(searchTerm);
		}
		
		return matchesCategory && matchesSearch;
	});

	const getCategoriaLabel = (value: string) => {
		return categorias.find(cat => cat.value === value)?.label || value;
	};

	const getRolLabel = (value: string) => {
		return roles.find(rol => rol.value === value)?.label || value;
	};

	const containerStyle: React.CSSProperties = {
		minHeight: '100vh',
		width: '100vw',
		background: 'linear-gradient(135deg, #047857 0%, #065f46 25%, #064e3b 50%, #0f172a 100%)',
		fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		display: 'flex',
		flexDirection: isMobile ? 'column' : 'row',
		position: 'fixed',
		top: 0,
		left: 0,
		overflow: 'hidden',
	};

	const sidebarStyle: React.CSSProperties = {
		width: isMobile ? '100%' : '280px',
		height: isMobile ? 'auto' : '100vh',
		maxHeight: isMobile ? '200px' : 'none',
		background: 'linear-gradient(145deg, #064e3b 0%, #065f46 50%, #047857 100%)',
		color: '#ffffff',
		display: 'flex',
		flexDirection: 'column',
		boxShadow: isMobile 
			? '0 8px 32px rgba(5, 95, 70, 0.15)' 
			: '8px 0 32px rgba(5, 95, 70, 0.15)',
		overflowY: isMobile ? 'auto' : 'visible',
		flexShrink: 0,
		backdropFilter: 'blur(10px)',
		borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
	};

	const mainContentStyle: React.CSSProperties = {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		height: isMobile ? 'calc(100vh - 200px)' : '100vh',
		background: 'rgba(15, 23, 42, 0.3)',
		backdropFilter: 'blur(10px)',
		borderLeft: isMobile ? 'none' : '1px solid rgba(16, 185, 129, 0.2)'
	};

	const headerStyle: React.CSSProperties = {
		background: 'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)',
		color: '#ffffff',
		padding: isMobile ? '20px 24px' : '24px 32px',
		boxShadow: '0 8px 32px rgba(4, 120, 87, 0.25)',
		flexShrink: 0,
		backdropFilter: 'blur(10px)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
		minHeight: '76px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	};

	const contentStyle: React.CSSProperties = {
		flex: 1,
		padding: isMobile ? '20px' : '32px',
		overflowY: 'auto',
		background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
	};

	// Eliminar documento en backend y frontend
	const eliminarDocumento = async (doc: Documento) => {
		showConfirmDialog(
			`¿Estás seguro de que quieres eliminar el documento "${doc.titulo}"?`,
			async () => {
			try {
				const token = localStorage.getItem('authToken');
				const res = await fetch(`/api/documents/${doc.id}`, {
					method: 'DELETE',
					headers: {
						...(token ? { 'Authorization': `Bearer ${token}` } : {}),
						'Content-Type': 'application/json'
					}
				});
				const data = await res.json();
				if (data.success) {
					setDocumentos(documentos.filter(d => d.id !== doc.id));
					showNotification('Documento eliminado exitosamente', 'success');
				} else {
					showNotification('Error: ' + (data.error?.message || 'No se pudo eliminar'), 'error');
				}
			} catch (err) {
				showNotification('Error de red o servidor', 'error');
				console.error(err);
			}
		}
		);
	};

	// Abrir modal en modo ver
	const handleVerDocumento = (doc: Documento) => {
		setDocActual(doc);
		setModoVista('ver');
		setShowUploadForm(true);
	};

	return (
		<div style={containerStyle}>
			{/* Sidebar */}
			<div style={sidebarStyle}>
				{/* Logo */}
				<div style={{ 
					padding: isMobile ? '16px 20px' : '24px 24px', 
					borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
					display: 'flex',
					alignItems: 'center',
					gap: isMobile ? '12px' : '16px',
					minHeight: isMobile ? 'auto' : '76px',
					height: isMobile ? 'auto' : '76px'
				}}>
													<div style={{
														background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
														borderRadius: isMobile ? '12px' : '16px',
														padding: isMobile ? '8px' : '12px',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														boxShadow: '0 8px 32px rgba(4, 120, 87, 0.3)'
													}}>
														<GraduationCap size={isMobile ? 20 : 28} color="#fff" />
													</div>
					<div>
						<div style={{ 
							fontWeight: '700', 
							fontSize: isMobile ? '16px' : '18px', 
							lineHeight: '1.2',
							color: '#ffffff'
						}}>
							ChatBot Universitario
						</div>
					</div>
				</div>

				{/* Navigation */}
				<div style={{ flex: 1, padding: isMobile ? '15px' : '20px' }}>
					<div style={{ marginBottom: isMobile ? '20px' : '30px' }}>
						<span style={{ 
							color: '#bdc3c7', 
							fontSize: isMobile ? '11px' : '12px', 
							fontWeight: '600', 
							textTransform: 'uppercase',
							letterSpacing: '1px',
							marginBottom: '15px',
							display: 'block'
						}}>
							NAVEGACIÓN
						</span>
						<div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
								<button
									style={{
										background: 'rgba(255, 255, 255, 0.1)',
										border: '1px solid rgba(255, 255, 255, 0.2)',
										color: 'rgba(255, 255, 255, 0.8)',
										padding: isMobile ? '12px 16px' : '14px 18px',
										borderRadius: '12px',
										display: 'flex',
										alignItems: 'center',
										gap: isMobile ? '10px' : '12px',
										cursor: 'pointer',
										fontSize: isMobile ? '13px' : '14px',
										fontWeight: '500',
										transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
										width: '100%',
										textAlign: 'left',
										backdropFilter: 'blur(10px)'
									}}
									onClick={() => window.location.href = '/admin/dashboard'}
								>
									<BarChart3 size={18} />
									Dashboard
								</button>
								<button
									style={{
										background: 'rgba(255, 255, 255, 0.1)',
										border: '1px solid rgba(255, 255, 255, 0.2)',
										color: 'rgba(255, 255, 255, 0.8)',
										padding: isMobile ? '12px 16px' : '14px 18px',
										borderRadius: '12px',
										display: 'flex',
										alignItems: 'center',
										gap: isMobile ? '10px' : '12px',
										cursor: 'pointer',
										fontSize: isMobile ? '13px' : '14px',
										fontWeight: '500',
										transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
										width: '100%',
										textAlign: 'left',
										backdropFilter: 'blur(10px)'
									}}
									onClick={() => window.location.href = '/admin/users'}
								>
									<Users size={18} />
									Gestión de Usuarios
								</button>
								<button
									style={{
										background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
										border: '1px solid rgba(255, 255, 255, 0.2)',
										color: '#ffffff',
										padding: isMobile ? '12px 16px' : '14px 18px',
										borderRadius: '12px',
										display: 'flex',
										alignItems: 'center',
										gap: isMobile ? '10px' : '12px',
										cursor: 'pointer',
										fontSize: isMobile ? '13px' : '14px',
										fontWeight: '600',
										transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
										width: '100%',
										textAlign: 'left',
										boxShadow: '0 4px 20px rgba(4, 120, 87, 0.25)',
										transform: 'translateY(0)'
									}}
								>
									<BarChart3 size={18} />
									Gestión de Documentos
								</button>
											<button
												style={{
													background: 'rgba(255, 255, 255, 0.1)',
													border: '1px solid rgba(255, 255, 255, 0.2)',
													color: 'rgba(255, 255, 255, 0.8)',
													padding: isMobile ? '12px 16px' : '14px 18px',
													borderRadius: '12px',
													display: 'flex',
													alignItems: 'center',
													gap: isMobile ? '10px' : '12px',
													cursor: 'pointer',
													fontSize: isMobile ? '13px' : '14px',
													fontWeight: '500',
													transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
													width: '100%',
													textAlign: 'left',
													backdropFilter: 'blur(10px)'
												}}
												onClick={() => window.location.href = '/chat'}
											>
												<MessageSquare size={18} />
												Chat
											</button>
						</div>
					</div>
				</div>

				{/* User Profile */}
				<div style={{ 
					padding: isMobile ? '15px' : '20px', 
					borderTop: '1px solid rgba(255, 255, 255, 0.1)',
					display: 'flex',
					alignItems: 'center',
					gap: isMobile ? '10px' : '12px'
				}}>
					<div style={{
						display: 'flex',
						alignItems: 'center',
						gap: isMobile ? '10px' : '12px',
						flex: 1,
						minWidth: 0
					}}>
						<div style={{
							background: 'rgba(255, 255, 255, 0.2)',
							borderRadius: '50%',
							width: isMobile ? '36px' : '40px',
							height: isMobile ? '36px' : '40px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}>
							   <Shield size={isMobile ? 18 : 20} />
						</div>
						<div style={{ flex: 1, minWidth: 0 }}>
							<div style={{ 
								fontWeight: '600', 
								fontSize: isMobile ? '13px' : '14px',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis'
							}}>Administrador</div>
							<div style={{ 
								fontSize: isMobile ? '11px' : '12px', 
								opacity: 0.7,
								whiteSpace: 'nowrap'
							}}>Admin</div>
						</div>
					</div>
									<button
										style={{
											background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
											border: 'none',
											color: '#ffffff',
											borderRadius: '8px',
											padding: isMobile ? '8px' : '10px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											cursor: 'pointer',
											transition: 'all 0.3s ease',
											boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
											width: isMobile ? '36px' : '40px',
											height: isMobile ? '36px' : '40px',
											flexShrink: 0
										}}
									>
										<ArrowRight size={isMobile ? 16 : 18} />
									</button>
				</div>
			</div>

			{/* Main Content */}
			<div style={mainContentStyle}>
				<header style={headerStyle}>
					<div>
						<h1 style={{ margin: 0, fontWeight: 700, fontSize: isMobile ? 22 : 26 }}>
							Gestión de Documentos
						</h1>
						<p style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: isMobile ? 14 : 16 }}>
							Administra y controla los documentos del sistema
						</p>
					</div>
					<button
						onClick={() => setShowUploadForm(!showUploadForm)}
						style={{
							background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
							border: 'none',
							color: '#ffffff',
							padding: isMobile ? '12px 20px' : '14px 24px',
							borderRadius: '12px',
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							cursor: 'pointer',
							fontSize: isMobile ? '14px' : '16px',
							fontWeight: '600',
							transition: 'all 0.3s ease',
							boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
						}}
					>
						<i className="fas fa-plus" />
						Subir Documento
					</button>
				</header>

				<div style={contentStyle}>
					{/* Modal/Form para subir documentos */}
					{showUploadForm && (
						<div style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: 'rgba(0, 0, 0, 0.5)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 1000,
							padding: '20px'
						}}>
							<div style={{
								background: '#ffffff',
								borderRadius: '16px',
								   padding: '32px 20px',
								width: '100%',
								maxWidth: '600px',
								maxHeight: '90vh',
								overflowY: 'auto',
								boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
							}}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
									<h2 style={{ margin: 0, color: '#047857', fontSize: '24px', fontWeight: '700' }}>
										{modoVista === 'ver' ? 'Ver Documento' : 
										 modoVista === 'editar' ? 'Editar Documento' : 
										 'Subir Nuevo Documento'}
									</h2>
									<button
										onClick={() => { 
											if (isEditing) {
												cancelEdit();
											} else {
												setShowUploadForm(false); 
												setDocActual(null); 
												setModoVista('subir');
											}
										}}
										style={{
											background: 'none',
											border: 'none',
											fontSize: '24px',
											cursor: 'pointer',
											color: '#6b7280',
											padding: '4px'
										}}
									>
										×
									</button>
								</div>
								{modoVista === 'ver' && docActual ? (
									<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
										<div>
											<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
												Título del Documento
											</label>
											<input
												type="text"
												value={docActual.titulo}
												readOnly
												style={{
													width: '100%',
													   padding: '12px 6px',
													border: '2px solid #e5e7eb',
													borderRadius: '8px',
													fontSize: '14px',
													background: '#f3f4f6',
													color: '#6b7280'
												}}
											/>
										</div>
										<div>
											<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
												Descripción
											</label>
											<textarea
												value={docActual.descripcion}
												readOnly
												rows={3}
												style={{
													width: '100%',
													padding: '12px 16px',
													border: '2px solid #e5e7eb',
													borderRadius: '8px',
													fontSize: '14px',
													background: '#f3f4f6',
													color: '#6b7280',
													resize: 'vertical'
												}}
											/>
										</div>
										<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
											<div>
												<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
													Categoría
												</label>
												<input
													type="text"
													value={getCategoriaLabel(docActual.categoria)}
													readOnly
													style={{
														width: '100%',
														padding: '12px 16px',
														border: '2px solid #e5e7eb',
														borderRadius: '8px',
														fontSize: '14px',
														background: '#f3f4f6',
														color: '#6b7280'
													}}
												/>
											</div>
											<div>
												<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
													Nivel de Acceso
												</label>
												<input
													type="text"
													value={getRolLabel(docActual.rolAcceso)}
													readOnly
													style={{
														width: '100%',
														padding: '12px 16px',
														border: '2px solid #e5e7eb',
														borderRadius: '8px',
														fontSize: '14px',
														background: '#f3f4f6',
														color: '#6b7280'
													}}
												/>
											</div>
										</div>
										<div>
											<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
												Archivo
											</label>
											<input
												type="text"
												value={docActual.fileName}
												readOnly
												style={{
													width: '100%',
													padding: '12px 16px',
													border: '2px solid #e5e7eb',
													borderRadius: '8px',
													fontSize: '14px',
													background: '#f3f4f6',
													color: '#6b7280'
												}}
											/>
										</div>
										<div>
											<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
												Fecha de Subida
											</label>
											<input
												type="text"
												value={new Date(docActual.fechaSubida).toLocaleDateString('es-ES')}
												readOnly
												style={{
													width: '100%',
													padding: '12px 16px',
													border: '2px solid #e5e7eb',
													borderRadius: '8px',
													fontSize: '14px',
													background: '#f3f4f6',
													color: '#6b7280'
												}}
											/>
										</div>
										<div>
											<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
												Tamaño
											</label>
											<input
												type="text"
												value={docActual.tamaño}
												readOnly
												style={{
													width: '100%',
													padding: '12px 16px',
													border: '2px solid #e5e7eb',
													borderRadius: '8px',
													fontSize: '14px',
													background: '#f3f4f6',
													color: '#6b7280'
												}}
											/>
										</div>
									</div>
								) : (
									<form onSubmit={isEditing ? handleUpdateDocument : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
										<div>
											<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
												Título del Documento *
											</label>
											<input
												type="text"
												value={titulo}
												onChange={e => setTitulo(e.target.value)}
												required
												   style={{
													   width: 'calc(100% - 16px)',
													   padding: '12px 6px',
													   border: '2px solid #e5e7eb',
													   borderRadius: '8px',
													   fontSize: '14px',
													   transition: 'border-color 0.3s ease',
													   outline: 'none',
													   backgroundColor: '#ffffff',
													   color: '#1f2937',
													   marginLeft: '8px',
													   marginRight: '8px'
												   }}
												onFocus={(e) => e.target.style.borderColor = '#047857'}
												onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
											/>
										</div>

										<div>
											<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
												Descripción
											</label>
											<textarea
												value={descripcion}
												onChange={e => setDescripcion(e.target.value)}
												rows={3}
												   style={{
													   width: 'calc(100% - 16px)',
													   padding: '12px 6px',
													   border: '2px solid #e5e7eb',
													   borderRadius: '8px',
													   fontSize: '14px',
													   transition: 'border-color 0.3s ease',
													   outline: 'none',
													   backgroundColor: '#ffffff',
													   color: '#1f2937',
													   marginLeft: '8px',
													   marginRight: '8px'
												   }}
												onFocus={(e) => e.target.style.borderColor = '#047857'}
												onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
											/>
										</div>

										<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
											<div>
												<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
													Categoría *
												</label>
												<select
													value={categoria}
													onChange={e => setCategoria(e.target.value)}
													required
													style={{
														width: '100%',
														padding: '12px 16px',
														border: '2px solid #e5e7eb',
														borderRadius: '8px',
														fontSize: '14px',
														backgroundColor: '#ffffff',
														appearance: 'none',
														color: '#1f2937',
														outline: 'none',
													}}
												>
													{categorias.map(opt => (
														<option key={opt.value} value={opt.value}>{opt.label}</option>
													))}
												</select>
											</div>

											<div>
												<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
													Nivel de Acceso *
												</label>
												<select
													value={rolAcceso}
													onChange={e => setRolAcceso(e.target.value)}
													required
													style={{
														width: '100%',
														padding: '12px 16px',
														border: '2px solid #e5e7eb',
														borderRadius: '8px',
														fontSize: '14px',
														backgroundColor: '#ffffff',
														appearance: 'none',
														color: '#1f2937',
														outline: 'none',
													}}
												>
													{roles.map(opt => (
														<option key={opt.value} value={opt.value}>{opt.label}</option>
													))}
												</select>
											</div>
										</div>

										{!isEditing && (
											<div>
												<label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
													Archivo (PDF) *
												</label>
												<input
													type="file"
													accept=".pdf"
													onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
													required
													style={{
														width: '100%',
														padding: '12px 16px',
														border: '2px solid #d1d5db',
														borderRadius: '8px',
														fontSize: '14px',
														backgroundColor: '#ffffff',
														color: '#1f2937',
														outline: 'none'
													}}
												/>
											</div>
										)}

										{isEditing && (
											<div style={{
												padding: '12px',
												background: '#f3f4f6',
												borderRadius: '8px',
												border: '1px solid #d1d5db'
											}}>
												<p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
													📄 <strong>Archivo actual:</strong> {documentoEditando?.fileName}
												</p>
												<p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
													Solo puedes actualizar el título, descripción, categoría y nivel de acceso.
												</p>
											</div>
										)}

										<div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
											<button
												type="button"
												onClick={() => isEditing ? cancelEdit() : setShowUploadForm(false)}
												style={{
													padding: '12px 24px',
													border: '2px solid #d1d5db',
													borderRadius: '8px',
													background: '#ffffff',
													color: '#374151',
													cursor: 'pointer',
													fontWeight: '600',
													transition: 'all 0.3s ease'
												}}
											>
												Cancelar
											</button>
											<button
												type="submit"
												style={{
													padding: '12px 24px',
													border: 'none',
													borderRadius: '8px',
													background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
													color: '#ffffff',
													cursor: 'pointer',
													fontWeight: '600',
													transition: 'all 0.3s ease',
													display: 'flex',
													alignItems: 'center',
													gap: '8px'
												}}
											>
												<i className={isEditing ? "fas fa-save" : "fas fa-upload"} />
												{isEditing ? 'Guardar Cambios' : 'Subir Documento'}
											</button>
										</div>
									</form>
								)}
							</div>
						</div>
					)}

					{/* Filtros y búsqueda */}
					<div style={{
						background: '#ffffff',
						borderRadius: '16px',
						padding: '24px',
						marginBottom: '24px',
						boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
						border: '1px solid rgba(16, 185, 129, 0.1)'
					}}>
						<div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', alignItems: 'center' }}>
							<div style={{ flex: 1 }}>
								<div style={{ position: 'relative' }}>
									<i className="fas fa-search" style={{
										position: 'absolute',
										left: '16px',
										top: '50%',
										transform: 'translateY(-50%)',
										color: '#6b7280'
									}} />
									<input
										type="text"
										placeholder="Buscar por título, descripción o autor..."
										value={search}
										onChange={e => setSearch(e.target.value)}
										style={{
											width: '100%',
											padding: '12px 16px 12px 48px',
											border: '2px solid #e5e7eb',
											borderRadius: '12px',
											fontSize: '14px',
											outline: 'none',
											transition: 'border-color 0.3s ease',
											backgroundColor: '#ffffff',
											color: '#1f2937'
										}}
										onFocus={(e) => e.target.style.borderColor = '#047857'}
										onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
									/>
								</div>
							</div>
							
							<select
								value={filterCategoria}
								onChange={e => setFilterCategoria(e.target.value)}
								style={{
									padding: '12px 16px',
									border: '2px solid #e5e7eb',
									borderRadius: '12px',
									fontSize: '14px',
									backgroundColor: '#ffffff',
									minWidth: '200px',
									outline: 'none'
								}}
							>
								<option value="">Todas las categorías</option>
								{categorias.filter(opt => opt.value).map(opt => (
									<option key={opt.value} value={opt.value}>{opt.label}</option>
								))}
							</select>
						</div>
					</div>

					{/* Estadísticas */}
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
						gap: '16px', 
						marginBottom: '24px' 
					}}>
						<div style={{
							background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
							color: '#ffffff',
							padding: '20px',
							borderRadius: '16px',
							boxShadow: '0 4px 20px rgba(4, 120, 87, 0.25)'
						}}>
							<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
								<i className="fas fa-file-alt" style={{ fontSize: '24px' }} />
								<div>
									<div style={{ fontSize: '28px', fontWeight: '700' }}>{filteredDocs.length}</div>
									<div style={{ fontSize: '14px', opacity: 0.9 }}>Total Documentos</div>
								</div>
							</div>
						</div>
					</div>

					{/* Lista de documentos */}
					<div style={{
						background: '#ffffff',
						borderRadius: '16px',
						boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
						border: '1px solid rgba(16, 185, 129, 0.1)',
						overflow: 'hidden'
					}}>
						{/* Header de la tabla */}
						<div style={{
							background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
							color: '#ffffff',
							padding: '16px 24px',
							display: 'grid',
							gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr 260px',
							gap: '16px',
							alignItems: 'center',
							fontWeight: '600',
							fontSize: '14px'
						}}>
							<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<i className="fas fa-file-alt" />
								Documento
							</div>
							{!isMobile && (
								<>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<i className="fas fa-tag" />
										Categoría
									</div>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<i className="fas fa-users" />
										Acceso
									</div>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<i className="fas fa-calendar" />
										Fecha
									</div>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<i className="fas fa-cog" />
										Acciones
									</div>
								</>
							)}
						</div>

						{/* Contenido de la tabla */}
						<div>
							{filteredDocs.length === 0 ? (
								<div style={{
									padding: '60px 24px',
									textAlign: 'center',
									color: '#6b7280'
								}}>
									<i className="fas fa-folder-open" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
									<div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
										No hay documentos disponibles
									</div>
									<div style={{ fontSize: '14px' }}>
										{search || filterCategoria ? 'No se encontraron documentos con los filtros aplicados' : 'Sube tu primer documento para comenzar'}
									</div>
								</div>
							) : (
								filteredDocs.map((doc, index) => (
									<div
										key={doc.id}
										style={{
											padding: '20px 24px',
											borderBottom: index < filteredDocs.length - 1 ? '1px solid #f3f4f6' : 'none',
											display: 'grid',
											gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr 260px',
											gap: '16px',
											alignItems: 'center',
											transition: 'background-color 0.3s ease',
											cursor: 'pointer'
										}}
										onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
										onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
									>
										{/* Información del documento */}
										<div>
											<div style={{ 
												fontWeight: '600', 
												fontSize: '16px', 
												color: '#111827',
												marginBottom: '4px',
												display: 'flex',
												alignItems: 'center',
												gap: '8px'
											}}>
												<i className="fas fa-file-pdf" style={{ color: '#ef4444' }} />
												{doc.titulo}
											</div>
											<div style={{ 
												fontSize: '14px', 
												color: '#6b7280',
												marginBottom: '4px'
											}}>
												{doc.descripcion || 'Sin descripción'}
											</div>
											<div style={{ 
												fontSize: '12px', 
												color: '#9ca3af',
												display: 'flex',
												alignItems: 'center',
												gap: '4px'
											}}>
												<i className="fas fa-file" />
												{doc.fileName} • {doc.tamaño}
											</div>
											{isMobile && (
												<div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
													<span style={{
														background: '#e0f2fe',
														color: '#0891b2',
														padding: '4px 8px',
														borderRadius: '6px',
														fontSize: '12px',
														fontWeight: '500'
													}}>
														{getCategoriaLabel(doc.categoria)}
													</span>
													<span style={{
														background: '#f0fdf4',
														color: '#15803d',
														padding: '4px 8px',
														borderRadius: '6px',
														fontSize: '12px',
														fontWeight: '500'
													}}>
														{getRolLabel(doc.rolAcceso)}
													</span>
													<span style={{
														background: '#fef3c7',
														color: '#d97706',
														padding: '4px 8px',
														borderRadius: '6px',
														fontSize: '12px',
														fontWeight: '500'
													}}>
														{new Date(doc.fechaSubida).toLocaleDateString('es-ES')}
													</span>
												</div>
											)}
										</div>

										{!isMobile && (
											<>
												{/* Categoría */}
												<div>
													<span style={{
														background: '#e0f2fe',
														color: '#0891b2',
														padding: '6px 12px',
														borderRadius: '8px',
														fontSize: '13px',
														fontWeight: '500'
													}}>
														{getCategoriaLabel(doc.categoria)}
													</span>
												</div>

												{/* Acceso */}
												<div>
													<span style={{
														background: '#f0fdf4',
														color: '#15803d',
														padding: '6px 12px',
														borderRadius: '8px',
														fontSize: '13px',
														fontWeight: '500'
													}}>
														{getRolLabel(doc.rolAcceso)}
													</span>
												</div>

												{/* Fecha */}
												<div style={{ 
													fontSize: '14px', 
													color: '#6b7280',
													fontWeight: '500'
												}}>
													{new Date(doc.fechaSubida).toLocaleDateString('es-ES')}
												</div>

												{/* Acciones */}
												<div style={{ 
													display: 'flex', 
													gap: isMobile ? '3px' : '6px',
													alignItems: 'center',
													justifyContent: isMobile ? 'center' : 'flex-start'
												}}>
													{/* Botón Descargar */}
													<button
														onClick={() => descargarDocumento(doc.id, doc.fileName)}
														style={{
															background: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
															border: 'none',
															color: '#ffffff',
															borderRadius: '6px',
															padding: isMobile ? '6px 8px' : '8px 12px',
															display: 'flex',
															alignItems: 'center',
															gap: '4px',
															cursor: 'pointer',
															transition: 'all 0.3s ease',
															fontSize: isMobile ? '10px' : '12px',
															fontWeight: '600',
															boxShadow: '0 1px 4px rgba(16, 185, 129, 0.3)',
															minWidth: isMobile ? '60px' : '80px',
															height: isMobile ? '32px' : '36px',
															justifyContent: 'center'
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.background = 'linear-gradient(135deg, #047857 0%, #10b981 100%)';
															e.currentTarget.style.transform = 'translateY(-1px)';
															e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.4)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #065f46 100%)';
															e.currentTarget.style.transform = 'translateY(0)';
															e.currentTarget.style.boxShadow = '0 1px 4px rgba(16, 185, 129, 0.3)';
														}}
														title="Descargar documento"
													>
														<Download size={12} />
														{!isMobile && 'Descargar'}
													</button>

													{/* Botón Editar */}
													<button
														onClick={() => startEditDocument(doc)}
														style={{
															background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
															border: 'none',
															color: '#ffffff',
															borderRadius: '6px',
															padding: isMobile ? '6px 8px' : '8px 12px',
															display: 'flex',
															alignItems: 'center',
															gap: '4px',
															cursor: 'pointer',
															fontSize: '12px',
															fontWeight: '500',
															transition: 'all 0.2s ease',
															boxShadow: '0 1px 4px rgba(245, 158, 11, 0.3)',
															minWidth: 'fit-content',
															height: isMobile ? '32px' : '36px',
															justifyContent: 'center'
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
															e.currentTarget.style.transform = 'translateY(-1px)';
															e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.4)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
															e.currentTarget.style.transform = 'translateY(0)';
															e.currentTarget.style.boxShadow = '0 1px 4px rgba(245, 158, 11, 0.3)';
														}}
														title="Editar documento"
													>
														<Edit2 size={12} />
														{!isMobile && 'Editar'}
													</button>

													{/* Botón Eliminar */}
													<button
														onClick={() => eliminarDocumento(doc)}
														style={{
															background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
															border: 'none',
															color: '#ffffff',
															borderRadius: '6px',
															padding: isMobile ? '6px 8px' : '8px 12px',
															display: 'flex',
															alignItems: 'center',
															gap: '4px',
															cursor: 'pointer',
															transition: 'all 0.3s ease',
															fontSize: isMobile ? '10px' : '12px',
															fontWeight: '600',
															boxShadow: '0 1px 4px rgba(239, 68, 68, 0.3)',
															minWidth: isMobile ? '60px' : '80px',
															height: isMobile ? '32px' : '36px',
															justifyContent: 'center'
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
															e.currentTarget.style.transform = 'translateY(-1px)';
															e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.4)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
															e.currentTarget.style.transform = 'translateY(0)';
															e.currentTarget.style.boxShadow = '0 1px 4px rgba(239, 68, 68, 0.3)';
														}}
														title="Eliminar documento"
													>
														<Trash2 size={12} />
														{!isMobile && 'Eliminar'}
													</button>
												</div>
											</>
										)}

										{/* Acciones para móvil */}
										{isMobile && (
											<div style={{ 
												marginTop: '12px', 
												display: 'flex', 
												gap: '8px',
												justifyContent: 'flex-end'
											}}>
												<button
													onClick={() => handleVerDocumento(doc)}
													style={{
														background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
														border: 'none',
														color: '#ffffff',
														padding: '8px 12px',
														borderRadius: '6px',
														cursor: 'pointer',
														fontSize: '12px',
														display: 'flex',
														alignItems: 'center',
														gap: '4px',
														fontWeight: '600'
													}}
												>
													<Eye size={14} />
													Ver
												</button>
												<button
													onClick={() => startEditDocument(doc)}
													style={{
														background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
														border: 'none',
														color: '#ffffff',
														padding: '8px 12px',
														borderRadius: '6px',
														cursor: 'pointer',
														fontSize: '12px',
														display: 'flex',
														alignItems: 'center',
														gap: '4px',
														fontWeight: '600'
													}}
												>
													<Edit2 size={14} />
													Editar
												</button>
												<button
													style={{
														background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
														border: 'none',
														color: '#ffffff',
														padding: '8px 12px',
														borderRadius: '6px',
														cursor: 'pointer',
														fontSize: '12px',
														display: 'flex',
														alignItems: 'center',
														gap: '4px',
														fontWeight: '600'
													}}
													onClick={() => eliminarDocumento(doc)}
												>
													<Trash2 size={14} />
													Eliminar
												</button>
											</div>
										)}
									</div>
								))
							)}
						</div>
					</div>

					{/* Paginación (opcional) */}
					{filteredDocs.length > 0 && (
						<div style={{
							marginTop: '24px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							padding: '16px 0'
						}}>
							<div style={{ fontSize: '14px', color: '#6b7280' }}>
								Mostrando {filteredDocs.length} de {documentos.length} documentos
							</div>
							{/* Aquí podrías agregar controles de paginación si es necesario */}
						</div>
					)}
				</div>
			</div>

			{/* Modal de Confirmación */}
			{confirmDialog.show && (
				<div style={{
					position: 'fixed' as const,
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 10000,
					padding: '20px'
				}}>
					<div style={{
						background: '#ffffff',
						borderRadius: '16px',
						padding: '32px',
						width: '100%',
						maxWidth: '480px',
						boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
						textAlign: 'center' as const
					}}>
						<div style={{
							marginBottom: '24px',
							display: 'flex',
							justifyContent: 'center'
						}}>
							<div style={{
								width: '64px',
								height: '64px',
								borderRadius: '50%',
								background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}>
								<Trash2 size={28} color="#ef4444" />
							</div>
						</div>
						<h3 style={{
							margin: '0 0 16px 0',
							fontSize: '20px',
							fontWeight: '700',
							color: '#1f2937'
						}}>
							Confirmar eliminación
						</h3>
						<p style={{
							margin: '0 0 32px 0',
							fontSize: '16px',
							color: '#6b7280',
							lineHeight: '1.5'
						}}>
							{confirmDialog.message}
						</p>
						<div style={{
							display: 'flex',
							gap: '12px',
							justifyContent: 'center'
						}}>
							<button
								onClick={confirmDialog.onCancel}
								style={{
									background: '#f8f9fa',
									border: 'none',
									color: '#6c757d',
									padding: '12px 24px',
									borderRadius: '8px',
									cursor: 'pointer',
									fontSize: '14px',
									fontWeight: '600',
									transition: 'all 0.3s ease'
								}}
							>
								Cancelar
							</button>
							<button
								onClick={confirmDialog.onConfirm}
								style={{
									background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
									border: 'none',
									color: '#ffffff',
									padding: '12px 24px',
									borderRadius: '8px',
									cursor: 'pointer',
									fontSize: '14px',
									fontWeight: '600',
									transition: 'all 0.3s ease'
								}}
							>
								Eliminar
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Notificación Toast */}
			{notification.show && (
				<div style={{
					position: 'fixed' as const,
					top: '20px',
					right: '20px',
					background: notification.type === 'success' 
						? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
						: notification.type === 'error'
						? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
						: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
					color: '#ffffff',
					padding: isMobile ? '16px 20px' : '18px 24px',
					borderRadius: '12px',
					boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
					zIndex: 10000,
					maxWidth: isMobile ? '280px' : '400px',
					fontSize: isMobile ? '14px' : '15px',
					fontWeight: '600',
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
					backdropFilter: 'blur(10px)',
					border: '1px solid rgba(255, 255, 255, 0.2)',
					animation: 'slideInRight 0.3s ease-out'
				}}>
					<div style={{
						width: '20px',
						height: '20px',
						borderRadius: '50%',
						background: 'rgba(255, 255, 255, 0.3)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0
					}}>
						{notification.type === 'success' && '✓'}
						{notification.type === 'error' && '✕'}
						{notification.type === 'info' && 'ℹ'}
					</div>
					<span style={{ lineHeight: '1.4' }}>{notification.message}</span>
				</div>
			)}

			{/* CSS para animaciones */}
			<style>
				{`
					@keyframes slideInRight {
						from {
							opacity: 0;
							transform: translateX(100%);
						}
						to {
							opacity: 1;
							transform: translateX(0);
						}
					}
				`}
			</style>
		</div>
	);
};



export default DocumentManagement;