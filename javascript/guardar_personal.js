// Recuperamos la información de edición si existe
const edicionInfo = JSON.parse(localStorage.getItem('usuarioAEditar'));
const titulo = document.getElementById('tituloPantalla');
const boton = document.getElementById('btnAccion');
const inputClave = document.getElementById('clave');
const selectRango = document.getElementById('rango');

// --- CONFIGURACIÓN INICIAL DEL FORMULARIO ---
if (edicionInfo) {
    titulo.innerText = "Editar Usuario";
    boton.innerText = "Guardar Cambios";
    boton.style.backgroundColor = "#c54b00";

    const d = edicionInfo.datos;
    document.getElementById('nombre').value = d.nombre || "";
    document.getElementById('apellido').value = d.apellido || "";
    document.getElementById('usuario').value = d.usuario || "";
    document.getElementById('cedula').value = d.cedula || "";
    document.getElementById('cedula').readOnly = true;
    document.getElementById('telefono').value = d.telefono || "";

    // CORRECCIÓN AQUÍ: 
    // En prepararEdicion usamos 'rango', así que aquí leemos 'd.rango'
    if (selectRango) {
        selectRango.value = d.rango || "";
    }

    inputClave.value = "";
    inputClave.placeholder = "Dejar en blanco para mantener clave actual";
} else {
    titulo.innerText = "Registrar Personal";
    boton.innerText = "Registrar Usuario";
    inputClave.placeholder = "La clave será su C.I. por defecto";
    inputClave.readOnly = true;
    inputClave.style.backgroundColor = "#e9e9e9";
}

// --- EVENTO SUBMIT ---
document.getElementById('formUsuario').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const cedula = document.getElementById('cedula').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const usuario = document.getElementById('usuario').value.trim();
    const rango = selectRango.value;
    let clave = inputClave.value;

    // --- VALIDACIONES ---
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const regexNumeros = /^[0-9]+$/;

    if (!regexLetras.test(nombre) || !regexLetras.test(apellido)) {
        return alert("⚠️ Nombre y Apellido solo deben contener letras.");
    }
    if (!regexNumeros.test(cedula) || cedula.length < 6) {
        return alert("⚠️ C.I. inválida.");
    }
    if (rango === "") {
        return alert("⚠️ Debe seleccionar un rango (rol).");
    }

    // --- LÓGICA DE CONTRASEÑA ---
    let enviarClave = true;
    if (edicionInfo) {
        // Si estamos editando y el campo está vacío, le avisamos al PHP que no cambie la clave
        if (clave === "") {
            enviarClave = false;
        } else {
            const regexFuerte = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!regexFuerte.test(clave)) {
                return alert("⚠️ La nueva clave no cumple los requisitos de seguridad.");
            }
        }
    } else {
        clave = cedula; // Registro nuevo: Clave = Cédula
    }

    const datosForm = {
        nombre,
        apellido,
        usuario,
        cedula,
        telefono,
        clave: enviarClave ? clave : null, // Si es null, el PHP sabrá que no debe actualizarla
        rol: parseInt(rango),
        esEdicion: !!edicionInfo
    };

    try {
        const response = await fetch('../../../php/guardar_usuario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosForm)
        });

        const resultado = await response.json();

        if (resultado.status === "success") {
            localStorage.removeItem('usuarioAEditar');
            alert(resultado.message);
            window.location.href = "../personal/per.html";
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        alert("🚫 Error de conexión.");
    }
});