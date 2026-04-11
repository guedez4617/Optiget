const edicionInfo = JSON.parse(localStorage.getItem('usuarioAEditar'));
const titulo = document.getElementById('tituloPantalla');
const boton = document.getElementById('btnAccion');
const inputClave = document.getElementById('clave');

if (edicionInfo) {
    titulo.innerText = "Editar Usuario";
    boton.innerText = "Guardar Cambios";
    boton.style.backgroundColor = "#c54b00";

    const d = edicionInfo.datos;
    document.getElementById('nombre').value = d.nombre || "";
    document.getElementById('apellido').value = d.apellido || "";
    document.getElementById('usuario').value = d.usuario;
    document.getElementById('cedula').value = d.cedula;
    document.getElementById('cedula').readOnly = true;
    document.getElementById('telefono').value = d.telefono;
    document.getElementById('rango').value = d.rango;

    // En edición, el campo clave empieza vacío para pedir la nueva
    inputClave.value = "";
    inputClave.placeholder = "Nueva clave (Letras, Números y Símbolos)";
} else {
    // Al registrar, avisamos que la clave será la cédula
    inputClave.placeholder = "La clave será su C.I. por defecto";
    inputClave.readOnly = true;
    inputClave.style.backgroundColor = "#e9e9e9";
}

document.getElementById('formUsuario').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const cedula = document.getElementById('cedula').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const usuario = document.getElementById('usuario').value.trim();
    const rango = document.getElementById('rango').value;
    let clave = inputClave.value;

    // --- VALIDACIONES DE FORMATO GENERAL ---
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const regexNumeros = /^[0-9]+$/;

    if (!regexLetras.test(nombre) || !regexLetras.test(apellido)) {
        return alert("⚠️ Nombre y Apellido solo letras.");
    }
    if (!regexNumeros.test(cedula) || cedula.length < 6 || /^0+$/.test(cedula)) {
        return alert("⚠️ C.I. inválida.");
    }
    if (telefono.length !== 11 || !telefono.startsWith("04")) {
        return alert("⚠️ Teléfono debe ser 04xx y tener 11 dígitos.");
    }

    // --- LÓGICA DE CONTRASEÑA ---
    if (edicionInfo) {
        // Validación de Clave Fuerte: Min 8 caracteres, letras, números y especial
        const regexFuerte = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!regexFuerte.test(clave)) {
            return alert("⚠️ La nueva clave debe tener al menos 8 caracteres, incluir letras, números y un carácter especial (@$!%*?&).");
        }
    } else {
        // Si es nuevo, la clave es la cédula
        clave = cedula;
    }

    const datosForm = {
        nombre,
        apellido,
        usuario,
        cedula,
        telefono,
        clave,
        rango,
        esEdicion: edicionInfo ? true : false
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
        alert("Error de conexión.");
    }
});