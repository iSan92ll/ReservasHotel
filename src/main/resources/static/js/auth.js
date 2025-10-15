// Elementos del DOM
const loginLink = document.getElementById('login-link');
const registerLink = document.getElementById('register-link');
const logoutLink = document.getElementById('logout-link');
const adminLink = document.getElementById('admin-link');
const cuentaLink = document.getElementById('cuenta-link');
const welcomeSection = document.getElementById('welcome-section');
const dashboardSection = document.getElementById('dashboard-section');
const adminSection = document.getElementById('admin-section');
const loginHeroBtn = document.getElementById('login-hero-btn');

// Modales
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));

// Estado de autenticación
let currentUser = null;
let isAdmin = false;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Event listeners
    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        mostrarLoginModal();
    });
    
    loginHeroBtn.addEventListener('click', function() {
        mostrarLoginModal();
    });
    
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        mostrarRegistroModal();
    });
    
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    adminLink.addEventListener('click', function(e) {
        e.preventDefault();
        toggleAdminPanel();
    });
    
    // Formularios
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
});

// Mostrar modal de login (con formulario limpio)
function mostrarLoginModal() {
    // Limpiar formulario antes de mostrar
    document.getElementById('login-form').reset();
    document.getElementById('admin-login').checked = false;
    loginModal.show();
}

// Mostrar modal de registro (con formulario limpio)
function mostrarRegistroModal() {
    // Limpiar formulario antes de mostrar
    document.getElementById('register-form').reset();
    
    // Reinicializar validaciones
    if (typeof reinicializarValidacionesModal === 'function') {
        reinicializarValidacionesModal();
    }
    
    registerModal.show();
}

// Verificar estado de autenticación
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        isAdmin = currentUser.rolUsuario === 'ADMIN';
        
        updateUIForAuth();
        
        // Cargar datos del usuario automáticamente
        cargarHabitacionesParaSelect();
        if (!isAdmin) {
            cargarMisReservas();
        }
    } else {
        updateUIForGuest();
    }
}

// Actualizar UI para usuario autenticado
function updateUIForAuth() {
    welcomeSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    adminSection.style.display = 'none';
    document.getElementById('user-name').textContent = `${currentUser.nombreUsuario} ${currentUser.apellidoUsuario}`;
    
    loginLink.style.display = 'none';
    registerLink.style.display = 'none';
    logoutLink.style.display = 'block';
    cuentaLink.style.display = 'block';
    cuentaLink.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.nombreUsuario}`;
    
    if (isAdmin) {
        adminLink.style.display = 'block';
    }
}

// Actualizar UI para invitado
function updateUIForGuest() {
    welcomeSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    adminSection.style.display = 'none';
    
    loginLink.style.display = 'block';
    registerLink.style.display = 'block';
    logoutLink.style.display = 'none';
    adminLink.style.display = 'none';
    cuentaLink.style.display = 'none';
}

// Manejar login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const isAdminLogin = document.getElementById('admin-login').checked;
    
    try {
        // Buscar usuario por email
        const response = await fetch(`${API_BASE_URL}/usuarios`);
        if (!response.ok) throw new Error('Error al cargar usuarios');
        
        const usuarios = await response.json();
        const usuario = usuarios.find(u => u.emailUsuario === email);
        
        if (!usuario) {
            alertify.error('Usuario no encontrado');
            return;
        }
        
        // En un sistema real, el hashing se haría en el backend
        // Por ahora mantenemos la verificación simple para compatibilidad
        if (usuario.contraUsuario !== password) {
            alertify.error('Contraseña incorrecta');
            return;
        }
        
        // Verificar rol si es login de admin
        if (isAdminLogin && usuario.rolUsuario !== 'ADMIN') {
            alertify.error('No tienes permisos de administrador');
            return;
        }
        
        // Guardar datos de autenticación
        localStorage.setItem('authToken', 'simulated-token-' + Date.now());
        localStorage.setItem('userData', JSON.stringify(usuario));
        
        currentUser = usuario;
        isAdmin = usuario.rolUsuario === 'ADMIN';
        
        updateUIForAuth();
        loginModal.hide();
        
        alertify.success(`Bienvenido ${usuario.nombreUsuario} tipo: ${usuario.rolUsuario}`);
        
        // Cargar datos según el tipo de usuario
        if (isAdmin) {
            cargarUsuarios();
        } else {
            cargarMisReservas();
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        alertify.error('Error al iniciar sesión');
    }
}

// Manejar registro
async function handleRegister(e) {
    e.preventDefault();
    
    // Validar formulario antes de enviar (SOLO AL ENVIAR)
    if (!validarFormularioRegistro()) {
        return;
    }
    
    const nombre = document.getElementById('register-nombre').value;
    const apellido = document.getElementById('register-apellido').value;
    const telefono = document.getElementById('register-telefono').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        // Verificar si el usuario ya existe
        const response = await fetch(`${API_BASE_URL}/usuarios`);
        if (!response.ok) throw new Error('Error al verificar usuarios');
        
        const usuarios = await response.json();
        const usuarioExistente = usuarios.find(u => u.emailUsuario === email);
        
        if (usuarioExistente) {
            mostrarErrorCampoRegistro(document.getElementById('register-email'), 'Ya existe un usuario con este email');
            return;
        }
        
        // Obtener teléfono formateado si está disponible
        let telefonoFormateado = telefono;
        const telefonoInfo = obtenerTelefonoFormateado();
        if (telefonoInfo) {
            telefonoFormateado = telefonoInfo.numero;
        }
        
        // Crear nuevo usuario
        const nuevoUsuario = {
            nombreUsuario: nombre.toString(),
            apellidoUsuario: apellido.toString(),
            numeroUsuario: telefonoFormateado.toString(),
            emailUsuario: email.toString(),
            rolUsuario: 'CLIENTE',
            contraUsuario: password.toString()
        };
        
        const createResponse = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoUsuario)
        });
        
        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Error al crear usuario: ${createResponse.status} - ${errorText}`);
        }
        
        const usuarioCreado = await createResponse.json();
        
        // Auto-login después del registro
        localStorage.setItem('authToken', 'simulated-token-' + Date.now());
        localStorage.setItem('userData', JSON.stringify(usuarioCreado));
        
        currentUser = usuarioCreado;
        isAdmin = false;
        
        updateUIForAuth();
        registerModal.hide();
        
        // Limpiar validaciones después de registro exitoso
        limpiarValidacionesRegistro();
        
        alertify.success('Registro exitoso. ¡Bienvenido!');
        
        // Cargar reservas del nuevo usuario
        cargarMisReservas();
        
    } catch (error) {
        console.error('Error en registro:', error);
        alertify.error('Error al registrarse');
    }
}

// Cerrar sesión
function logout() {
    // Limpiar datos de autenticación
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    currentUser = null;
    isAdmin = false;
    
    // Limpiar formularios
    document.getElementById('login-form').reset();
    
    updateUIForGuest();
    alertify.message('Sesión cerrada');
}

// Alternar panel de administración
function toggleAdminPanel() {
    if (adminSection.style.display === 'none') {
        adminSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        mostrarTabAdmin('usuarios');
    } else {
        adminSection.style.display = 'none';
        dashboardSection.style.display = 'block';
    }
}

// Mostrar tab de administración
function mostrarTabAdmin(tab) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.admin-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Remover clase active de todos los tabs
    document.querySelectorAll('.admin-tab').forEach(tabEl => {
        tabEl.classList.remove('active');
    });
    
    // Mostrar contenido seleccionado y activar tab
    document.getElementById(`admin-${tab}`).style.display = 'block';
    event.target.classList.add('active');
    
    // Cargar datos de la pestaña seleccionada
    switch(tab) {
        case 'usuarios':
            cargarUsuarios();
            break;
        case 'habitaciones':
            cargarHabitacionesAdmin();
            break;
        case 'reservaciones':
            cargarReservacionesAdmin();
            break;
    }
}

// Verificar autenticación antes de acciones
function requireAuth() {
    if (!currentUser) {
        alertify.error('Debes iniciar sesión para realizar esta acción');
        mostrarLoginModal();
        return false;
    }
    return true;
}

// Verificar permisos de administrador
function requireAdmin() {
    if (!isAdmin) {
        alertify.error('No tienes permisos de administrador');
        return false;
    }
    return true;
}

// Habitaciones Admin
// Función para crear nueva habitación (admin)
async function crearHabitacion(habitacionData) {
    if (!requireAdmin()) return null;
    
    try {
        const response = await fetch(`${API_BASE_URL}/habitaciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(habitacionData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al crear habitación: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        alertify.error(error.message);
        return null;
    }
}

// Función para eliminar habitación (admin)
async function eliminarHabitacion(idHabitacion) {
    if (!requireAdmin()) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/habitaciones/${idHabitacion}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar habitación');
        }
        
        return true;
    } catch (error) {
        console.error('Error:', error);
        alertify.error(error.message);
        return false;
    }
}

// Función para actualizar habitación (admin)
async function actualizarHabitacion(idHabitacion, habitacionData) {
    if (!requireAdmin()) return null;
    
    try {
        const response = await fetch(`${API_BASE_URL}/habitaciones/${idHabitacion}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(habitacionData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al actualizar habitación: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        alertify.error(error.message);
        return null;
    }
}

// Función para eliminar usuario (admin)
async function eliminarUsuario(idUsuario) {
    if (!requireAdmin()) return false;
    
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar usuario');
        }
        
        alertify.success('Usuario eliminado exitosamente');
        cargarUsuarios();
        return true;
    } catch (error) {
        console.error('Error:', error);
        alertify.error(error.message);
        return false;
    }
}

// Función para editar reservación (placeholder)
function editarReservacion(idReserva) {
    alertify.alert('Editar Reservación', 'Funcionalidad de edición de reservación en desarrollo');
}