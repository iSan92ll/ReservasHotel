let iti = null; //Banderas

// Inicializar validaciones al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(inicializarValidacionesFechas, 500);
    setTimeout(inicializarValidacionesRegistro, 500);
    inicializarValidacionesFechas();
});

function inicializarValidacionesRegistro() {
    inicializarTelefonoInternacional();
    configurarValidacionesEnTiempoReal();
}

// Validación de texto real usando LanguageTool API
async function validarTextoRealAPI(texto, campo, tipo = "general", errores) {
    if (!errores) errores = 1; // Número máximo de errores permitidos
    try {
        const response = await fetch("https://api.languagetoolplus.com/v2/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `text=${encodeURIComponent(texto)}&language=es`
        });
        const data = await response.json();
        if (data.matches && data.matches.length > errores) {
            mostrarErrorCampoRegistro(campo, `El texto ingresado en ${tipo} no parece válido o contiene palabras inventadas.`);
            return false;
        }
        campo.classList.add('is-valid');
        return true;
    } catch (e) {
        mostrarErrorCampoRegistro(campo, "No se pudo validar el texto. Intente más tarde.");
        return false;
    }
}

// Inicializar el validador de teléfono internacional
function inicializarTelefonoInternacional() {
    const telefonoInput = document.getElementById('register-telefono');
    
    if (telefonoInput && window.intlTelInput) {
        iti = window.intlTelInput(telefonoInput, {
            initialCountry: "co",
            preferredCountries: ["co", "us", "mx", "es", "ar", "gb", "de"],
            hiddenInput: "full_phone",
            dropdownContainer: document.body,
            geoIpLookup: function(callback) {
                fetch("https://ipapi.co/json")
                    .then(res => res.json())
                    .then(data => callback(data.country_code))
                    .catch(() => callback("us"));
            },
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
        });

        // Validar teléfono al cambiar (sin bloquear interfaz)
        telefonoInput.addEventListener('blur', function() {
            validarTelefono();
        });
        
        telefonoInput.addEventListener('input', function() {
            limpiarValidacion(this);
        });

        const dropdown = document.querySelector('.iti__country-list');
        if (dropdown) {
            dropdown.style.zIndex = '9999';
        }
    }
}

// Configurar validaciones en tiempo real para todos los campos
function configurarValidacionesEnTiempoReal() {
    const nombreInput = document.getElementById('register-nombre');
    const apellidoInput = document.getElementById('register-apellido');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const telefonoInput = document.getElementById('register-telefono');

    if (nombreInput) {
        nombreInput.addEventListener('blur', function() {
            validarNombreCompleto(this, 'nombre');
        });
        nombreInput.addEventListener('input', function() {
            limpiarValidacion(this);
        });
    }

    if (apellidoInput) {
        apellidoInput.addEventListener('blur', function() {
            validarNombreCompleto(this, 'apellido');
        });
        apellidoInput.addEventListener('input', function() {
            limpiarValidacion(this);
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validarEmailRegistro();
        });
        emailInput.addEventListener('input', function() {
            limpiarValidacion(this);
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            validarPassword();
        });
        passwordInput.addEventListener('input', function() {
            limpiarValidacion(this);
        });
    }

    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            limpiarValidacion(this);
        });
    }
}

// Limpiar estados de validación (NO BLOQUEA LA INTERFAZ)
function limpiarValidacion(campo) {
    if (!campo) return;
    
    campo.classList.remove('is-invalid', 'is-valid');
    
    // Remover mensaje de error
    const feedback = campo.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.remove();
    }
}

// Validar formulario completo de registro (SOLO AL ENVIAR)
function validarFormularioRegistro() {
    let valido = true;
    
    // Validar todos los campos en secuencia
    if (!validarNombreCompleto(document.getElementById('register-nombre'), 'nombre')) {
        valido = false;
    }
    
    if (!validarNombreCompleto(document.getElementById('register-apellido'), 'apellido')) {
        valido = false;
    }
    
    if (!validarEmailRegistro()) {
        valido = false;
    }
    
    if (!validarTelefono()) {
        valido = false;
    }
    
    if (!validarPassword()) {
        valido = false;
    }
    
    // Si hay errores, desplazar al primer error
    if (!valido) {
        const primerError = document.querySelector('.is-invalid');
        if (primerError) {
            primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        mostrarNotificacionRegistro('Por favor, corrige los errores en el formulario', 'error');
    }
    
    return valido;
}


// Validar nombre completo (nombre y apellido)
async function validarNombreCompleto(campo, tipo = 'nombre') {
    if (document.getElementById('register-nombre').value === document.getElementById('register-apellido').value) {
        mostrarErrorCampoRegistro(campo, "El nombre y apellido no pueden ser iguales");
        return false;
    }

    if (!campo) {
        if (tipo === 'nombre') {
            campo = document.getElementById('register-nombre');
        } else {
            campo = document.getElementById('register-apellido');
        }
    }
    
    if (!campo) return false;
    
    const valor = campo.value.trim();
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']+$/;
    
    campo.classList.remove('is-valid', 'is-invalid');
    
    if (!valor) {
        mostrarErrorCampoRegistro(campo, `El ${tipo} no puede estar vacío`);
        return false;
    }
    
    if (!regex.test(valor)) {
        mostrarErrorCampoRegistro(campo, `El ${tipo} solo puede contener letras, espacios, apóstrofes y tildes`);
        return false;
    }
    
    const palabras = valor.split(/\s+/).filter(p => p.length > 0);
    
    if (palabras.length === 0) {
        mostrarErrorCampoRegistro(campo, `El ${tipo} no puede estar vacío`);
        return false;
    }

    if (palabras.some(p => p.length < 3)) {
        mostrarErrorCampoRegistro(campo, `Cada palabra en el ${tipo} debe tener al menos 3 letras`);
        return false;
    }
    
    if (palabras.some(p => /(.)\1\1/.test(p))) {
        mostrarErrorCampoRegistro(campo, `Las palabras no pueden tener más de dos letras iguales seguidas`);
        return false;
    }

    if (valor.length < 3) {
        mostrarErrorCampoRegistro(campo, `El ${tipo} debe tener al menos 3 caracteres`);
        return false;
    }

    if (valor.length > 30) {
        mostrarErrorCampoRegistro(campo, `El ${tipo} no puede tener más de 30 caracteres`);
        return false;
    }
    if (!await validarTextoRealAPI(valor, campo, "nombre", 1)) return false;
    campo.classList.add('is-valid');
    return true;
}

// Validar email para registro
function validarEmailRegistro() {
    const campo = document.getElementById('register-email');
    if (!campo) return false;
    
    const valor = campo.value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,}(\.com|\.co|\.gov\.co|\.gov\.com|\.org|\.edu\.co|\.net|\.info)$/i;
    const emailRegex2 = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z]{2,}(\.com|\.co|\.gov\.co|\.gov\.com|\.org|\.edu\.co|\.net|\.info)$/i;
    
    campo.classList.remove('is-valid', 'is-invalid');
    
    if (!valor) {
        mostrarErrorCampoRegistro(campo, 'El email no puede estar vacío');
        return false;
    }
    
    if (!emailRegex.test(valor) && !emailRegex2.test(valor)) {
        mostrarErrorCampoRegistro(campo, 'El correo debe tener un formato válido (ej: usuario@dominio.com)');
        return false;
    }
    
    // Validar estructura básica del email
    const partes = valor.split('@');
    if (partes.length !== 2) {
        mostrarErrorCampoRegistro(campo, 'Formato de email inválido');
        return false;
    }
    
    const usuario = partes[0];
    const dominio = partes[1];
    
    if (usuario.length < 3) {
        mostrarErrorCampoRegistro(campo, 'La parte del usuario debe tener al menos 3 caracteres');
        return false;
    }
    
    if (dominio.length < 5) {
        mostrarErrorCampoRegistro(campo, 'El dominio del email es demasiado corto');
        return false;
    }
    
    campo.classList.add('is-valid');
    return true;
}

// Validar teléfono internacional
function validarTelefono() {
    const campo = document.getElementById('register-telefono');
    if (!campo || !iti) return false;
    
    const valor = campo.value.trim();
    
    campo.classList.remove('is-valid', 'is-invalid');
    
    if (!valor) {
        mostrarErrorCampoRegistro(campo, 'El teléfono no puede estar vacío');
        return false;
    }
    
    // Validar usando la API de intl-tel-input
    if (!iti.isValidNumber()) {
        mostrarErrorCampoRegistro(campo, 'Número de teléfono no válido');
        return false;
    }
    
    // Validar longitud mínima (incluyendo código de país)
    const numeroCompleto = iti.getNumber();
    if (numeroCompleto.replace(/\D/g, '').length < 8) {
        mostrarErrorCampoRegistro(campo, 'El número de teléfono es demasiado corto');
        return false;
    }
    
    campo.classList.add('is-valid');
    return true;
}

// Validar contraseña
function validarPassword() {
    const campo = document.getElementById('register-password');
    if (!campo) return false;
    
    const valor = campo.value;
    
    campo.classList.remove('is-valid', 'is-invalid');
    
    if (!valor) {
        mostrarErrorCampoRegistro(campo, 'La contraseña no puede estar vacía');
        return false;
    }
    
    if (valor.length < 6) {
        mostrarErrorCampoRegistro(campo, 'La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    if (valor.length > 50) {
        mostrarErrorCampoRegistro(campo, 'La contraseña no puede tener más de 50 caracteres');
        return false;
    }
    
    // Validar seguridad básica
    const tieneMayuscula = /[A-Z]/.test(valor);
    const tieneMinuscula = /[a-z]/.test(valor);
    const tieneNumero = /[0-9]/.test(valor);
    
    let criteriosCumplidos = 0;
    if (tieneMayuscula) criteriosCumplidos++;
    if (tieneMinuscula) criteriosCumplidos++;
    if (tieneNumero) criteriosCumplidos++;
    
    if (criteriosCumplidos < 2) {
        mostrarErrorCampoRegistro(campo, 'La contraseña debe incluir al menos 2 de los siguientes: mayúsculas, minúsculas, números');
        return false;
    }
    
    // Verificar contraseñas comunes o inseguras
    const contraseñasDebiles = [
        '123456', 'password', 'contraseña', 'admin', 'qwerty','000000', '111111', 'abc123', 'password1', '12345678'];

    if (contraseñasDebiles.includes(valor.toLowerCase())) {
        mostrarErrorCampoRegistro(campo, 'Esta contraseña es muy común, elige una más segura');
        return false;
    }
    
    campo.classList.add('is-valid');
    return true;
}

// Mostrar error en campo específico (SIN BLOQUEAR INTERFAZ)
function mostrarErrorCampoRegistro(campo, mensaje) {
    campo.classList.add('is-invalid');
    campo.classList.remove('is-valid');
    
    // Remover feedback anterior si existe
    const feedbackExistente = campo.parentElement.querySelector('.invalid-feedback');
    if (feedbackExistente) {
        feedbackExistente.remove();
    }
    
    // Crear nuevo elemento de feedback
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = mensaje;
    feedback.style.display = 'block';
    
    // Insertar después del campo
    campo.parentElement.appendChild(feedback);
}

// Mostrar notificación de registro
function mostrarNotificacionRegistro(mensaje, tipo = 'info') {
    // Usar alertify.js si está disponible
    if (window.alertify) {
        switch(tipo) {
            case 'error':
                alertify.error(mensaje);
                break;
            case 'success':
                alertify.success(mensaje);
                break;
            default:
                alertify.message(mensaje);
        }
    } else {
        // Fallback a alert nativo
        alert(mensaje);
    }
}

// Obtener teléfono formateado internacionalmente
function obtenerTelefonoFormateado() {
    if (!iti) return null;
    
    if (iti.isValidNumber()) {
        return {
            numero: iti.getNumber(),
            pais: iti.getSelectedCountryData().name,
            codigoPais: iti.getSelectedCountryData().iso2
        };
    }
    
    return null;
}

// Limpiar todas las validaciones del formulario
function limpiarValidacionesRegistro() {
    const campos = document.querySelectorAll('#register-form input');
    campos.forEach(campo => {
        campo.classList.remove('is-invalid', 'is-valid');
        const feedback = campo.parentElement.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.remove();
        }
    });
}

// Verificar si el formulario es válido
function esFormularioRegistroValido() {
    const camposInvalidos = document.querySelectorAll('#register-form .is-invalid');
    return camposInvalidos.length === 0;
}

// Función para reinicializar cuando se abre el modal
function reinicializarValidacionesModal() {
    // Limpiar validaciones previas
    limpiarValidacionesRegistro();
    
    // Reinicializar el validador de teléfono
    setTimeout(inicializarTelefonoInternacional, 100);
}

function inicializarValidacionesFechas() {
    const fechaInicio = document.getElementById('fecha-inicio');
    const fechaFin = document.getElementById('fecha-fin');

    //fecha inicio no mas lejos de 3 meses
    if (fechaInicio) {
        const tresMesesDesdeHoy = new Date();
        tresMesesDesdeHoy.setMonth(tresMesesDesdeHoy.getMonth() + 3);
        fechaInicio.max = tresMesesDesdeHoy.toISOString().split('T')[0];
    }

    //fechafin maximo 30 dias despues de fecha inicio
    if (fechaFin) {
        const maxFechaFin = new Date();
        maxFechaFin.setMonth(maxFechaFin.getMonth() + 3);
        maxFechaFin.setDate(maxFechaFin.getDate() + 30);
        fechaFin.max = maxFechaFin.toISOString().split('T')[0];
    }

    if (fechaInicio && fechaFin) {
        // Establecer fecha mínima como hoy
        const hoy = new Date().toISOString().split('T')[0];
        fechaInicio.min = hoy;
        fechaFin.min = hoy;
        
        // Event listeners para validación en tiempo real
        fechaInicio.addEventListener('change', function() {
            validarFechasReserva();
            actualizarFechaMinimaCheckout();
            if (typeof actualizarResumenReserva === 'function') {
                actualizarResumenReserva();
            }
        });
        
        fechaFin.addEventListener('change', function() {
            validarFechasReserva();
            if (typeof actualizarResumenReserva === 'function') {
                actualizarResumenReserva();
            }
        });
        
        fechaInicio.addEventListener('blur', function() {
            validarFechasReserva();
        });
        
        fechaFin.addEventListener('blur', function() {
            validarFechasReserva();
        });
    }
}

// Validar que la fecha de check-out sea al menos un día después del check-in
function validarFechasReserva() {
    const fechaInicio = document.getElementById('fecha-inicio');
    const fechaFin = document.getElementById('fecha-fin');
    
    if (!fechaInicio || !fechaFin) return true;
    
    const inicioValor = fechaInicio.value;
    const finValor = fechaFin.value;
    
    // Limpiar validaciones previas
    limpiarValidacion(fechaInicio);
    limpiarValidacion(fechaFin);
    
    // Si alguna fecha está vacía, no validar
    if (!inicioValor || !finValor) {
        return true;
    }
    
    const inicio = new Date(inicioValor);
    const fin = new Date(finValor);
    
    // Validar que la fecha de fin sea después de la fecha de inicio
    if (fin <= inicio) {
        mostrarErrorCampoRegistro(fechaFin, 'La fecha de check-out debe ser posterior a la fecha de check-in');
        return false;
    }
    
    // Validar que haya al menos una noche de diferencia
    const diferenciaTiempo = fin.getTime() - inicio.getTime();
    const diferenciaDias = diferenciaTiempo / (1000 * 3600 * 24);
    
    if (diferenciaDias < 1) {
        mostrarErrorCampoRegistro(fechaFin, 'La estadía mínima es de 1 noche. Seleccione una fecha de check-out al menos un día después del check-in');
        return false;
    }
    
    if (diferenciaDias > 30) {
        mostrarErrorCampoRegistro(fechaFin, 'La estadía máxima permitida es de 30 noches');
        return false;
    }
    
    // Si todo está bien, marcar como válido
    fechaFin.classList.add('is-valid');
    fechaInicio.classList.add('is-valid');
    return true;
}

// Actualizar fecha mínima de check-out basada en check-in seleccionado
function actualizarFechaMinimaCheckout() {
    const fechaInicio = document.getElementById('fecha-inicio');
    const fechaFin = document.getElementById('fecha-fin');
    
    if (!fechaInicio || !fechaFin) return;
    
    const inicioValor = fechaInicio.value;
    
    if (inicioValor) {
        const inicio = new Date(inicioValor);
        const minFechaFin = new Date(inicio);
        minFechaFin.setDate(minFechaFin.getDate() + 1);
        
        fechaFin.min = minFechaFin.toISOString().split('T')[0];
        
        // Si la fecha fin actual es anterior a la nueva fecha mínima, resetearla
        const finValor = fechaFin.value;
        if (finValor && new Date(finValor) < minFechaFin) {
            fechaFin.value = '';
            limpiarValidacion(fechaFin);
        }
    }
}

// Exportar funciones para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validarFormularioRegistro,
        validarNombreCompleto,
        validarEmailRegistro,
        validarTelefono,
        validarPassword,
        obtenerTelefonoFormateado,
        limpiarValidacionesRegistro,
        esFormularioRegistroValido,
        reinicializarValidacionesModal
    };
}