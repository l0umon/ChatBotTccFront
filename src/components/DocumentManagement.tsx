import React, { useState, useEffect } from 'react';

interface Documento {
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
	const [modoVista, setModoVista] = useState<'subir' | 'ver'>('subir');

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
				if (res.ok && Array.isArray(data.documentos)) {
					setDocumentos(data.documentos);
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
				// Opcional: notificación de éxito
				alert('Documento subido correctamente');
			} else {
				alert('Error al subir el documento: ' + (data?.message || 'Error desconocido'));
			}
		} catch (error) {
			alert('Error de red al subir el documento: ' + (error instanceof Error ? error.message : ''));
		}
	};

	const filteredDocs = documentos.filter(doc =>
		(filterCategoria ? doc.categoria === filterCategoria : true) &&
		(search ? doc.titulo.toLowerCase().includes(search.toLowerCase()) : true)
	);

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
		if (!window.confirm('¿Estás seguro de que quieres eliminar este documento?')) return;
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
				alert('Documento eliminado exitosamente');
			} else {
				alert('Error: ' + (data.error?.message || 'No se pudo eliminar'));
			}
		} catch (err) {
			alert('Error de red o servidor');
			console.error(err);
		}
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
						<i className="fas fa-graduation-cap" style={{ color: '#fff', fontSize: isMobile ? 20 : 28 }} />
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
								<i className="fas fa-chart-pie" />
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
								onClick={() => window.location.href = '/admin/gestion-usuarios.html'}
							>
								<i className="fas fa-users" />
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
								<i className="fas fa-file-alt" />
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
								<i className="fas fa-comments" />
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
							<i className="fas fa-user" style={{ color: '#fff', fontSize: isMobile ? 18 : 20 }} />
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
						<i className="fas fa-sign-out-alt" />
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
								padding: '32px',
								width: '100%',
								maxWidth: '600px',
								maxHeight: '90vh',
								overflowY: 'auto',
								boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
							}}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
									<h2 style={{ margin: 0, color: '#047857', fontSize: '24px', fontWeight: '700' }}>
										{modoVista === 'ver' ? 'Ver Documento' : 'Subir Nuevo Documento'}
									</h2>
									<button
										onClick={() => { setShowUploadForm(false); setDocActual(null); setModoVista('subir'); }}
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
									<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
													width: '100%',
													padding: '12px 16px',
													border: '2px solid #e5e7eb',
													borderRadius: '8px',
													fontSize: '14px',
													transition: 'border-color 0.3s ease',
													outline: 'none',
													backgroundColor: '#ffffff',
													color: '#1f2937'
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
													width: '100%',
													padding: '12px 16px',
													border: '2px solid #e5e7eb',
													borderRadius: '8px',
													fontSize: '14px',
													transition: 'border-color 0.3s ease',
													outline: 'none',
													backgroundColor: '#ffffff',
													color: '#1f2937'
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

										<div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
											<button
												type="button"
												onClick={() => setShowUploadForm(false)}
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
												<i className="fas fa-upload" />
												Subir Documento
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
										placeholder="Buscar documentos por nombre"
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
							gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr 120px',
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
						<div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
											gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr 120px',
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
												<div style={{ display: 'flex', gap: '8px' }}>
													<button
														style={{
															background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
															border: 'none',
															color: '#ffffff',
															padding: '8px',
															borderRadius: '6px',
															cursor: 'pointer',
															transition: 'all 0.3s ease',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center'
														}}
														title="Descargar"
													>
														<i className="fas fa-download" style={{ fontSize: '12px' }} />
													</button>
													<button
														style={{
															background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
															border: 'none',
															color: '#ffffff',
															padding: '8px',
															borderRadius: '6px',
															cursor: 'pointer',
															transition: 'all 0.3s ease',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center'
														}}
														title="Ver"
														onClick={() => handleVerDocumento(doc)}
													>
														<i className="fas fa-eye" style={{ fontSize: '12px' }} />
													</button>
													<button
														style={{
															background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
															border: 'none',
															color: '#ffffff',
															padding: '8px',
															borderRadius: '6px',
															cursor: 'pointer',
															transition: 'all 0.3s ease',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center'
														}}
														title="Eliminar"
														onClick={() => eliminarDocumento(doc)}
													>
														<i className="fas fa-trash" style={{ fontSize: '12px' }} />
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
													style={{
														background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
														border: 'none',
														color: '#ffffff',
														padding: '8px 12px',
														borderRadius: '6px',
														cursor: 'pointer',
														fontSize: '12px',
														display: 'flex',
														alignItems: 'center',
														gap: '4px'
													}}
												>
													<i className="fas fa-download" />
													Descargar
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
														gap: '4px'
													}}
													onClick={() => eliminarDocumento(doc)}
												>
													<i className="fas fa-trash" />
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
		</div>
	);
};



export default DocumentManagement;