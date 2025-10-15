const API_BASE_URL = 'http://localhost:8080/api';

// Elementos del DOM
const habitacionesList = document.getElementById('habitaciones-list');
const misReservasList = document.getElementById('mis-reservas-list');
const reservasList = document.getElementById('reservas-list');
const reservaForm = document.getElementById('reserva-form');
const habitacionSelect = document.getElementById('habitacion');

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    // Cargar habitaciones disponibles automáticamente
    cargarHabitaciones();
    cargarHabitacionesParaSelect();
    
    // Si hay usuario logueado, cargar sus reservas
    if (currentUser) {
        cargarMisReservas();
    }
});

// Cargar habitaciones disponibles
async function cargarHabitaciones() {
    try {
        habitacionesList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando habitaciones...</p></div>';
        
        const response = await fetch(`${API_BASE_URL}/habitaciones`);
        
        if (!response.ok) {
            throw new Error('Error al cargar habitaciones');
        }
        
        const habitaciones = await response.json();

        // Filtrar solo las habitaciones disponibles
        const habitacionesDisponibles = habitaciones.filter(habitacion =>
            habitacion.estadoHabitacion === 'DISPONIBLE'
        );

        if (habitacionesDisponibles.length === 0) {
            habitacionesList.innerHTML = '<div class="error">No hay habitaciones disponibles</div>';
            return;
        }

        mostrarHabitaciones(habitacionesDisponibles);
    } catch (error) {
        console.error('Error:', error);
        habitacionesList.innerHTML = `<div class="error">Error al cargar habitaciones:</div>`;
    }
}

// Mostrar habitación por id
async function cargarHabitacionPorId(idHabitacion) {
    try {
        const response = await fetch(`${API_BASE_URL}/habitaciones/${idHabitacion}`);

        if (!response.ok) {
            throw new Error('Error al cargar habitación');
        }

        const habitacion = await response.json();

        return habitacion.numeroHabitacion;
    } catch (error) {
        console.error('Error:', error);
        return 'N/A';
    }
}

// Mostrar usuario por id
async function cargarUsuarioPorId(idUsuario) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}`);

        if (!response.ok) {
            throw new Error('Error al cargar usuario');
        }

        const usuario = await response.json();

        return `${usuario.nombreUsuario} ${usuario.apellidoUsuario}`;
    } catch (error) {
        console.error('Error:', error);
        return 'N/A';
    }
}

// Mostrar email por id
async function cargarEmailPorId(idUsuario) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}`);

        if (!response.ok) {
            throw new Error('Error al cargar email');
        }

        const usuario = await response.json();

        return usuario.emailUsuario;
    } catch (error) {
        console.error('Error:', error);
        return 'N/A';
    }
}

// Mostrar habitaciones en el grid
function mostrarHabitaciones(habitaciones) {
    habitacionesList.innerHTML = habitaciones.map(habitacion => `
        <div class="habitacion-card">
            <h3>Habitación ${habitacion.numeroHabitacion}</h3>
            <div class="precio">$${habitacion.precioHabitacion || '0.00'} <small>/noche</small></div>
            <div class="capacidad"><i class="fas fa-users"></i> Capacidad: ${habitacion.capacidadHabitacion} personas</div>
            <div class="tipo"><i class="fas fa-tag"></i> Tipo: ${habitacion.tipoHabitacion || 'Standard'}</div>
            <div class="estado ${habitacion.estadoHabitacion === 'DISPONIBLE' ? 'disponible' : 
                               habitacion.estadoHabitacion === 'OCUPADA' ? 'ocupada' : 'mantenimiento'}">
                ${habitacion.estadoHabitacion || 'DISPONIBLE'}
            </div>
        </div>
    `).join('');
}

// Cargar habitaciones para el select del formulario
async function cargarHabitacionesParaSelect() {
    try {
        const response = await fetch(`${API_BASE_URL}/habitaciones`);
        const habitaciones = await response.json();

        // Filtrar solo las habitaciones disponibles
        const habitacionesDisponibles = habitaciones.filter(habitacion => 
            habitacion.estadoHabitacion === 'DISPONIBLE'
        );
        
        habitacionSelect.innerHTML = '<option value="">Seleccione una habitación</option>' +
            habitacionesDisponibles.map(habitacion => `
                <option value="${habitacion.idHabitacion}" data-precio="${habitacion.precioHabitacion}">
                    Habitación ${habitacion.numeroHabitacion} ${habitacion.tipoHabitacion} - $${habitacion.precioHabitacion || '0.00'}/noche
                </option>
            `).join('');
            
        // Agregar event listener para calcular precio al cambiar habitación
        habitacionSelect.addEventListener('change', actualizarResumenReserva);
    } catch (error) {
        console.error('Error al cargar habitaciones para select:', error);
    }
}

// Actualizar resumen de reserva
function actualizarResumenReserva() {
    const fechaInicio = document.getElementById('fecha-inicio');
    const fechaFin = document.getElementById('fecha-fin');
    const resumenReserva = document.getElementById('resumen-reserva');
    const nochesReserva = document.getElementById('noches-reserva');
    const precioTotal = document.getElementById('precio-total');
    const fechaInicioResumen = document.getElementById('fechaInicioresumen');
    const fechaFinResumen = document.getElementById('fechaFinresumen');

    if (fechaInicio.value && fechaFin.value && habitacionSelect.value) {
        const inicio = new Date(fechaInicio.value);
        const fin = new Date(fechaFin.value);
        const diferenciaTiempo = fin.getTime() - inicio.getTime();
        const noches = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
        
        if (noches > 0) {
            const precioNoche = parseFloat(habitacionSelect.selectedOptions[0].dataset.precio) || 0;
            const total = noches * precioNoche;
            
            nochesReserva.textContent = `Noches: ${noches}`;
            precioTotal.textContent = `Precio total: $${total.toFixed(2)}`;
            fechaInicioResumen.textContent = `Check-in: ${inicio.toLocaleDateString()} - 2:00 PM`;
            fechaFinResumen.textContent = `Check-out: ${fin.toLocaleDateString()} - 12:00 PM`;
            resumenReserva.style.display = 'block';
        } else {
            resumenReserva.style.display = 'none';
        }
    } else {
        resumenReserva.style.display = 'none';
    }
}

// Manejar envío del formulario de reserva
reservaForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validarFechasReserva()) {
        return;
    }

    if (!requireAuth()) return;
    
    const formData = new FormData(reservaForm);
    const fechaInicio = formData.get('fechaInicio');
    const fechaFin = formData.get('fechaFin');
    
    // Validar que las fechas sean válidas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferenciaTiempo = fin.getTime() - inicio.getTime();
    const noches = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    
    if (noches <= 0) {
        alertify.error('La fecha de salida debe ser posterior a la de entrada');
        return;
    }
    
    const reservaData = {
        habitacion: parseInt(formData.get('habitacion')),
        usuario: currentUser.idUsuario,
        inicioReserva: fechaInicio + 'T14:00:00', // Check-in a las 2 PM
        finReserva: fechaFin + 'T12:00:00', // Check-out a las 12 PM
        estadoReserva: 'PENDIENTE'
    };
    console.log('Creando reserva:', reservaData);
    const habitacionData = {
        idHabitacion: parseInt(formData.get('habitacion')),
        estadoHabitacion: 'OCUPADA'
    }

    // Actualizar estado de la habitacion a OCUPADA
    const idHabitacion = habitacionData.idHabitacion;
    try {
        // 1. Primero obtener el registro completo
        const responseHabitacion = await fetch(`${API_BASE_URL}/habitaciones/${idHabitacion}`);
        if (!responseHabitacion.ok) throw new Error('Error al obtener habitación');
        
        const habitacionActual = await responseHabitacion.json();
        
        // 2. Combinar con los nuevos campos (sin modificar los demás)
        const habitacionActualizada = {
            ...habitacionActual,  // Mantener todos los campos existentes
            ...habitacionData   // Sobrescribir solo los campos que queremos cambiar
        };
        
        console.log('Actualizando habitación:', habitacionActualizada);
        
        // 3. Enviar el objeto completo al backend
        const updateResponse = await fetch(`${API_BASE_URL}/habitaciones/${idHabitacion}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(habitacionActualizada)
        });
        
        if (!updateResponse.ok) {
            throw new Error('Error al actualizar habitación');
        }
        
        // Crear la reserva
        const response = await fetch(`${API_BASE_URL}/reservaciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservaData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al crear reserva: ${response.status} - ${errorText}`);
        }
        
        const reservaCreada = await response.json();
        
        alertify.success(`Reserva creada exitosamente para la habitación ${reservaCreada.habitacion?.numeroHabitacion}`);
        
        // Limpiar formulario
        reservaForm.reset();
        document.getElementById('resumen-reserva').style.display = 'none';
        
        // Recargar datos actualizados
        cargarHabitaciones();
        cargarHabitacionesParaSelect();
        cargarMisReservas();
        
        // Si es admin, recargar también el panel admin
        if (isAdmin) {
            cargarHabitacionesAdmin();
            cargarReservacionesAdmin();
        }
        
    } catch (error) {
        console.error('Error al crear reserva o actualizar habitación:', error);
        alertify.error(`Error: ${error.message}`);
    }
});

// Cargar reservas del usuario actual
async function cargarMisReservas() {
    if (!requireAuth()) return;
    
    try {
        misReservasList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando reservas...</p></div>';
        
        const response = await fetch(`${API_BASE_URL}/reservaciones`);
        
        if (!response.ok) {
            throw new Error('Error al cargar reservas');
        }
        
        const reservas = await response.json();
        
        // Filtrar reservas del usuario actual
        const misReservas = reservas.filter(reserva => 
            reserva.usuario === currentUser.idUsuario
        );

        // Enriquecer reservas con datos de habitación
        const reservasEnriquecidas = await Promise.all(
            misReservas.map(async (reserva) => {
                const numeroHabitacion = await cargarHabitacionPorId(reserva.habitacion);
                return {
                    ...reserva,
                    numeroHabitacion: numeroHabitacion
                };
            })
        );
        
        if (misReservas.length === 0) {
            misReservasList.innerHTML = '<div class="error">No tienes reservas</div>';
            return;
        }
        
        mostrarMisReservas(reservasEnriquecidas);
    } catch (error) {
        console.error('Error:', error);
        misReservasList.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Mostrar reservas del usuario en la lista
function mostrarMisReservas(reservas) {
    misReservasList.innerHTML = reservas.map(reserva => `
        <div class="reserva-item">
            <h4>Reserva #${reserva.idReserva}</h4>
            <p><strong>Habitación:</strong> ${reserva.numeroHabitacion || 'N/A'}</p>
            <p><strong>Check-in:</strong> ${new Date(reserva.inicioReserva).toLocaleDateString()} - 2:00 PM</p>
            <p><strong>Check-out:</strong> ${new Date(reserva.finReserva).toLocaleDateString()} - 12:00 PM</p>
            <p><strong>Estado:</strong> <span class="estado ${reserva.estadoReserva?.toLowerCase() || 'pendiente'}">${reserva.estadoReserva || 'PENDIENTE'}</span></p>
            <div class="reserva-actions">
                <button class="cta-button secondary" onclick="cancelarReserva(${reserva.idReserva})" ${reserva.estadoReserva !== 'PENDIENTE' ? 'disabled' : ''}>
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `).join('');
}

//Un usuario no puede tener mas de 3 reservaciones
async function validarLimiteReservas() {
    if (!requireAuth()) return;

    try {
        const response = await fetch(`${API_BASE_URL}/reservaciones`);
        if (!response.ok) throw new Error('Error al cargar reservas');

        const reservas = await response.json();
        const reservasUsuario = reservas.filter(reserva => reserva.usuario === currentUser.idUsuario);

        if (reservasUsuario.length >= 3) {
            alertify.error('No puedes tener más de 3 reservaciones activas');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        alertify.error(`Error al validar límite de reservas: ${error.message}`);
        return false;
    }

    return true;
}

// Cancelar reserva
async function cancelarReserva(idReserva) {
    if (!requireAuth()) return;
    
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
        return;
    }
    
    try {
        // Primero obtener la reserva para saber qué habitación liberar
        const responseReserva = await fetch(`${API_BASE_URL}/reservaciones/${idReserva}`);
        if (!responseReserva.ok) throw new Error('Error al obtener reserva');
        
        const reserva = await responseReserva.json();
        
        // Liberar la habitación
        const responseHabitacion = await fetch(`${API_BASE_URL}/habitaciones/${reserva.habitacion}`);
        if (!responseHabitacion.ok) throw new Error('Error al obtener habitación');
        
        const habitacionActual = await responseHabitacion.json();
        
        const habitacionActualizada = {
            ...habitacionActual,
            estadoHabitacion: 'DISPONIBLE'
        };
        
        const updateHabitacionResponse = await fetch(`${API_BASE_URL}/habitaciones/${reserva.habitacion}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(habitacionActualizada)
        });
        
        if (!updateHabitacionResponse.ok) {
            throw new Error('Error al liberar habitación');
        }
        
        // Eliminar la reserva
        const response = await fetch(`${API_BASE_URL}/reservaciones/${idReserva}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al cancelar reserva');
        }
        
        alertify.success('Reserva cancelada exitosamente');
        
        // Recargar datos actualizados
        cargarMisReservas();
        cargarHabitaciones();
        cargarHabitacionesParaSelect();
        
    } catch (error) {
        console.error('Error:', error);
        alertify.error(`Error al cancelar reserva: ${error.message}`);
    }
}

// Mostrar formulario de reserva
function mostrarFormularioReserva() {
    document.getElementById('reservas').scrollIntoView({ behavior: 'smooth' });
}

// Funciones de administración

// Cargar usuarios (admin)
async function cargarUsuarios() {
    if (!requireAdmin()) return;
    
    try {
        const usuariosList = document.getElementById('usuarios-list');
        usuariosList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando usuarios...</p></div>';
        
        const response = await fetch(`${API_BASE_URL}/usuarios`);
        if (!response.ok) throw new Error('Error al cargar usuarios');
        
        const usuarios = await response.json();
        mostrarUsuarios(usuarios);
    } catch (error) {
        console.error('Error:', error);
        alertify.error('Error al cargar usuarios');
    }
}

// Mostrar usuarios en panel admin
function mostrarUsuarios(usuarios) {
    const usuariosList = document.getElementById('usuarios-list');
    
    if (usuarios.length === 0) {
        usuariosList.innerHTML = '<div class="error">No hay usuarios registrados</div>';
        return;
    }
    
    usuariosList.innerHTML = `
        <div class="admin-header">
            <h4>Total de usuarios: ${usuarios.length}</h4>
        </div>
        <div class="admin-grid">
            ${usuarios.map(usuario => `
                <div class="admin-item">
                    <div class="admin-item-header">
                        <h4>${usuario.nombreUsuario} ${usuario.apellidoUsuario}</h4>
                        <div class="admin-item-actions">
                            <button class="btn-icon btn-delete" onclick="eliminarUsuario(${usuario.idUsuario})" ${usuario.idUsuario === currentUser.idUsuario ? 'disabled' : ''}>
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p><strong>Email:</strong> ${usuario.emailUsuario}</p>
                    <p><strong>Teléfono:</strong> ${usuario.numeroUsuario}</p>
                    <p><strong>Rol:</strong> ${usuario.rolUsuario}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Cargar habitaciones (admin)
async function cargarHabitacionesAdmin() {
    if (!requireAdmin()) return;
    
    try {
        const habitacionesList = document.getElementById('habitaciones-admin-list');
        habitacionesList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando habitaciones...</p></div>';
        
        const response = await fetch(`${API_BASE_URL}/habitaciones`);
        if (!response.ok) throw new Error('Error al cargar habitaciones');
        
        const habitaciones = await response.json();
        mostrarHabitacionesAdmin(habitaciones);
    } catch (error) {
        console.error('Error:', error);
        alertify.error('Error al cargar habitaciones');
    }
}

// Mostrar habitaciones en panel admin
function mostrarHabitacionesAdmin(habitaciones) {
    const habitacionesList = document.getElementById('habitaciones-admin-list');
    
    if (habitaciones.length === 0) {
        habitacionesList.innerHTML = '<div class="error">No hay habitaciones registradas</div>';
        return;
    }
    
    habitacionesList.innerHTML = `
        <div class="admin-header">
            <h4>Total de habitaciones: ${habitaciones.length}</h4>
            <button class="cta-button" onclick="mostrarFormularioHabitacion()">
                <i class="fas fa-plus"></i> Nueva Habitación
            </button>
        </div>
        <div class="admin-grid">
            ${habitaciones.map(habitacion => `
                <div class="admin-item">
                    <div class="admin-item-header">
                        <h4>Habitación ${habitacion.numeroHabitacion}</h4>
                        <span class="estado ${habitacion.estadoHabitacion === 'DISPONIBLE' ? 'disponible' : 
                                            habitacion.estadoHabitacion === 'OCUPADA' ? 'ocupada' : 'mantenimiento'}">
                            ${habitacion.estadoHabitacion}
                        </span>
                    </div>
                    <div class="admin-item-details">
                        <p><strong>Capacidad:</strong> ${habitacion.capacidadHabitacion} personas</p>
                        <p><strong>Precio:</strong> $${habitacion.precioHabitacion} por noche</p>
                        <p><strong>Tipo:</strong> ${habitacion.tipoHabitacion}</p>
                        <p><strong>ID:</strong> ${habitacion.idHabitacion}</p>
                    </div>
                    <div class="admin-actions">
                        <button class="btn-icon btn-edit" onclick="mostrarFormularioHabitacion(${JSON.stringify(habitacion).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="confirmarEliminarHabitacion(${habitacion.idHabitacion}, '${habitacion.numeroHabitacion}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Funciones de administración para habitaciones

// Mostrar formulario para nueva habitación
function mostrarFormularioHabitacion(habitacion = null) {
    const esEdicion = habitacion !== null;
    
    const formularioHTML = `
        <div class="form-container">
            <h3><i class="fas ${esEdicion ? 'fa-edit' : 'fa-plus'}"></i> ${esEdicion ? 'Editar' : 'Nueva'} Habitación</h3>
            <form id="${esEdicion ? 'editar' : 'nueva'}-habitacion-form" class="reserva-form">
                <div class="form-group">
                    <label for="numero-habitacion"><i class="fas fa-hashtag"></i> Número de Habitación:</label>
                    <input type="text" id="numero-habitacion" name="numeroHabitacion" 
                           value="${esEdicion ? habitacion.numeroHabitacion : ''}" required 
                           maxlength="10">
                </div>
                <div class="form-group">
                    <label for="capacidad-habitacion"><i class="fas fa-users"></i> Capacidad:</label>
                    <input type="number" id="capacidad-habitacion" name="capacidadHabitacion" 
                           value="${esEdicion ? habitacion.capacidadHabitacion : ''}" required 
                           min="1" max="10">
                </div>
                <div class="form-group">
                    <label for="precio-habitacion"><i class="fas fa-dollar-sign"></i> Precio por Noche:</label>
                    <input type="number" id="precio-habitacion" name="precioHabitacion" 
                           value="${esEdicion ? habitacion.precioHabitacion : ''}" required 
                           min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="tipo-habitacion"><i class="fas fa-tag"></i> Tipo de Habitación:</label>
                    <select id="tipo-habitacion" name="tipoHabitacion" required>
                        <option value="">Seleccione tipo</option>
                        <option value="ESTANDAR" ${esEdicion && habitacion.tipoHabitacion === 'ESTANDAR' ? 'selected' : ''}>Estandar</option>
                        <option value="LUJO" ${esEdicion && habitacion.tipoHabitacion === 'LUJO' ? 'selected' : ''}>Lujo</option>
                        <option value="SUITE" ${esEdicion && habitacion.tipoHabitacion === 'SUITE' ? 'selected' : ''}>Suite</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="estado-habitacion"><i class="fas fa-info-circle"></i> Estado:</label>
                    <select id="estado-habitacion" name="estadoHabitacion" required>
                        <option value="DISPONIBLE" ${esEdicion && habitacion.estadoHabitacion === 'DISPONIBLE' ? 'selected' : ''}>Disponible</option>
                        <option value="OCUPADA" ${esEdicion && habitacion.estadoHabitacion === 'OCUPADA' ? 'selected' : ''}>Ocupada</option>
                        <option value="MANTENIMIENTO" ${esEdicion && habitacion.estadoHabitacion === 'MANTENIMIENTO' ? 'selected' : ''}>Mantenimiento</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-button">
                        <i class="fas ${esEdicion ? 'fa-save' : 'fa-plus'}"></i> ${esEdicion ? 'Actualizar' : 'Crear'} Habitación
                    </button>
                    <button type="button" class="cta-button secondary" onclick="cerrarFormularioHabitacion()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </form>
        </div>
    `;
    
    const contenedor = document.getElementById('habitaciones-admin-list');
    contenedor.innerHTML = formularioHTML;
    
    // Agregar event listener al formulario
    const formId = esEdicion ? 'editar-habitacion-form' : 'nueva-habitacion-form';
    document.getElementById(formId).addEventListener('submit', function(e) {
        e.preventDefault();
        if (esEdicion) {
            editarHabitacionSubmit(habitacion.idHabitacion);
        } else {
            crearHabitacionSubmit();
        }
    });
}

// Cerrar formulario de habitación
function cerrarFormularioHabitacion() {
    cargarHabitacionesAdmin();
}

// Manejar envío del formulario de nueva habitación
async function crearHabitacionSubmit() {
    const formData = new FormData(document.getElementById('nueva-habitacion-form'));

    //Limitar numero de habitacion a 3 caracteres
    if (formData.get('numeroHabitacion').length > 3) {
        alertify.error('El número de habitación no puede exceder los 3 caracteres');
        return;
    }

    //Formato valido para una habitacion "101", "201" etc
    const numeroHabitacionPattern = /^[0-9]{3}$/;
    if (!numeroHabitacionPattern.test(formData.get('numeroHabitacion'))) {
        alertify.error('El número de habitación debe tener un formato válido (ej. 101, 202)');
        return;
    }
    
    const habitacionData = {
        numeroHabitacion: formData.get('numeroHabitacion'),
        capacidadHabitacion: parseInt(formData.get('capacidadHabitacion')),
        precioHabitacion: parseFloat(formData.get('precioHabitacion')),
        tipoHabitacion: formData.get('tipoHabitacion'),
        estadoHabitacion: formData.get('estadoHabitacion')
    };
    
    console.log('Creando habitación:', habitacionData);
    
    const habitacionCreada = await crearHabitacion(habitacionData);
    if (habitacionCreada) {
        alertify.success('Habitación creada exitosamente');
        cargarHabitacionesAdmin();
        cargarHabitaciones(); // Actualizar también la vista pública
        cargarHabitacionesParaSelect();
    }
}

// Manejar envío del formulario de edición de habitación
async function editarHabitacionSubmit(idHabitacion) {
    const formData = new FormData(document.getElementById('editar-habitacion-form'));
    
    const habitacionData = {
        numeroHabitacion: formData.get('numeroHabitacion'),
        capacidadHabitacion: parseInt(formData.get('capacidadHabitacion')),
        precioHabitacion: parseFloat(formData.get('precioHabitacion')),
        tipoHabitacion: formData.get('tipoHabitacion'),
        estadoHabitacion: formData.get('estadoHabitacion')
    };
    
    console.log('Actualizando habitación:', habitacionData);
    
    const habitacionActualizada = await actualizarHabitacion(idHabitacion, habitacionData);
    if (habitacionActualizada) {
        alertify.success('Habitación actualizada exitosamente');
        cargarHabitacionesAdmin();
        cargarHabitaciones(); // Actualizar también la vista pública
        cargarHabitacionesParaSelect();
    }
}

// Confirmar eliminación de habitación
function confirmarEliminarHabitacion(idHabitacion, numeroHabitacion) {
    alertify.confirm(
        'Confirmar Eliminación',
        `¿Estás seguro de que deseas eliminar la habitación ${numeroHabitacion}?`,
        async function() {
            const eliminado = await eliminarHabitacion(idHabitacion);
            if (eliminado) {
                alertify.success('Habitación eliminada exitosamente');
                cargarHabitacionesAdmin();
                cargarHabitaciones(); // Actualizar también la vista pública
                cargarHabitacionesParaSelect();
            }
        },
        function() {
            alertify.message('Eliminación cancelada');
        }
    );
}

// Cargar todas las reservaciones (admin)
async function cargarReservacionesAdmin() {
    if (!requireAdmin()) return;
    
    try {
        const reservacionesList = document.getElementById('reservaciones-admin-list');
        reservacionesList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando reservaciones...</p></div>';
        
        const response = await fetch(`${API_BASE_URL}/reservaciones`);
        if (!response.ok) throw new Error('Error al cargar reservaciones');
        
        const reservaciones = await response.json();
        
        const reservasEnriquecidas = await Promise.all(
            reservaciones.map(async (reserva) => {
                const numeroHabitacion = await cargarHabitacionPorId(reserva.habitacion);
                const nombreUsuario = await cargarUsuarioPorId(reserva.usuario);
                const emailUsuario = await cargarEmailPorId(reserva.usuario);
                return {
                    ...reserva,
                    numeroHabitacion: numeroHabitacion,
                    nombreUsuario: nombreUsuario,
                    emailUsuario: emailUsuario
                };
            })
        );
        
        mostrarReservacionesAdmin(reservasEnriquecidas);
    } catch (error) {
        console.error('Error:', error);
        alertify.error('Error al cargar reservaciones');
    }
}

// Mostrar reservaciones en panel admin
function mostrarReservacionesAdmin(reservaciones) {
    const reservacionesList = document.getElementById('reservaciones-admin-list');
    
    if (reservaciones.length === 0) {
        reservacionesList.innerHTML = '<div class="error">No hay reservaciones registradas</div>';
        return;
    }

    reservacionesList.innerHTML = `
        <div class="admin-header">
            <h4>Total de reservaciones: ${reservaciones.length}</h4>
            <div class="reservas-stats">
                <span class="estado pendiente">PENDIENTE: ${reservaciones.filter(r => r.estadoReserva === 'PENDIENTE').length}</span>
                <span class="estado confirmada">CONFIRMADA: ${reservaciones.filter(r => r.estadoReserva === 'CONFIRMADA').length}</span>
                <span class="estado cancelada">CANCELADA: ${reservaciones.filter(r => r.estadoReserva === 'CANCELADA').length}</span>
            </div>
        </div>
        <div class="admin-grid">
            ${reservaciones.map(reserva => `
                <div class="admin-item">
                    <div class="admin-item-header">
                        <h4>Reserva #${reserva.idReserva}</h4>
                        <span class="estado ${reserva.estadoReserva === 'CONFIRMADA' ? 'confirmada' : 
                                            reserva.estadoReserva === 'PENDIENTE' ? 'pendiente' : 'cancelada'}">
                            ${reserva.estadoReserva}
                        </span>
                    </div>
                    <div class="admin-item-details">
                        <p><strong>Usuario:</strong> ${reserva.nombreUsuario || 'N/A'}</p>
                        <p><strong>Habitación:</strong> ${reserva.numeroHabitacion || 'N/A'}</p>
                        <p><strong>Check-in:</strong> ${new Date(reserva.inicioReserva).toLocaleString()}</p>
                        <p><strong>Check-out:</strong> ${new Date(reserva.finReserva).toLocaleString()}</p>
                        <p><strong>Email:</strong> ${reserva.emailUsuario || 'N/A'}</p>
                    </div>
                    <div class="admin-actions">
                        <button class="btn-icon btn-success" onclick="cambiarEstadoReserva(${reserva.idReserva}, 'CONFIRMADA')" title="Confirmar">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon btn-warning" onclick="cambiarEstadoReserva(${reserva.idReserva}, 'PENDIENTE')" title="Pendiente">
                            <i class="fas fa-clock"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="cambiarEstadoReserva(${reserva.idReserva}, 'CANCELADA')" title="Cancelar">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="eliminarReservacion(${reserva.idReserva})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Cambiar estado de reservación
async function cambiarEstadoReserva(idReserva, nuevoEstado) {
    if (!requireAdmin()) return;
    
    try {
        // Primero obtener la reserva actual
        const response = await fetch(`${API_BASE_URL}/reservaciones/${idReserva}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al obtener reserva: ${response.status} - ${errorText}`);
        }
        
        const reservaActual = await response.json();
        
        // Actualizar solo el estado
        const reservaActualizada = {
            ...reservaActual,
            estadoReserva: nuevoEstado
        };
        
        const updateResponse = await fetch(`${API_BASE_URL}/reservaciones/${idReserva}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservaActualizada)
        });
        
        if (!updateResponse.ok) {
            throw new Error('Error al actualizar reserva');
        }
        
        alertify.success(`Reserva ${nuevoEstado.toLowerCase()} exitosamente`);

        // Recargar datos actualizados
        cargarReservacionesAdmin();
        cargarHabitaciones();
        cargarHabitacionesParaSelect();
        
        // Si el usuario actual tiene esta reserva, actualizar también su vista
        if (currentUser && reservaActual.usuario === currentUser.idUsuario) {
            cargarMisReservas();
        }
    } catch (error) {
        console.error('Error:', error);
        alertify.error('Error al cambiar estado de reserva');
    }
}

// Función para eliminar reservación (admin)
async function eliminarReservacion(idReserva) {
    if (!requireAdmin()) return false;
    
    if (!confirm('¿Estás seguro de que deseas eliminar esta reservación?')) {
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/reservaciones/${idReserva}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar reservación');
        }
        
        alertify.success('Reservación eliminada exitosamente');
        
        // Recargar datos actualizados
        cargarReservacionesAdmin();
        cargarHabitaciones();
        cargarHabitacionesParaSelect();
        
        return true;
    } catch (error) {
        console.error('Error:', error);
        alertify.error(error.message);
        return false;
    }
}

function togglePasswordVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    }
}

// Función para probar la conexión con la API
async function probarAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/habitaciones`);
        if (response.ok) {
            console.log('Conexión con la API establecida');
        } else {
            console.log('Error en la conexión con la API');
        }
    } catch (error) {
        console.log('No se pudo conectar con la API');
    }
}

// Probar la conexión al cargar la página
probarAPI();

// Configurar event listeners para fechas
document.addEventListener('DOMContentLoaded', function() {
    const fechaInicio = document.getElementById('fecha-inicio');
    const fechaFin = document.getElementById('fecha-fin');
    
    if (fechaInicio && fechaFin) {
        fechaInicio.addEventListener('change', actualizarResumenReserva);
        fechaFin.addEventListener('change', actualizarResumenReserva);
        
        // Establecer fecha mínima como hoy
        const hoy = new Date().toISOString().split('T')[0];
        fechaInicio.min = hoy;
        fechaFin.min = hoy;
    }
});