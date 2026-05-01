const usuarioActivoRaw = localStorage.getItem("usuario");
const usuarioActivo = usuarioActivoRaw ? JSON.parse(usuarioActivoRaw) : null;

const edicionInfo = JSON.parse(localStorage.getItem('usuarioAEditar'));
const titulo = document.getElementById('tituloPantalla');
const boton = document.getElementById('btnAccion');
const inputClave = document.getElementById('clave');
const selectRango = document.getElementById('rango');

const inputNombre = document.getElementById('nombre');
const inputApellido = document.getElementById('apellido');
const inputUsuario = document.getElementById('usuario');
const inputCedula = document.getElementById('cedula');
const inputTelefono = document.getElementById('telefono');


function validarTelefono(telefono) {
    if (!telefono.startsWith("04")) {
        alert("❌ El teléfono debe comenzar con 04");
        return false;
    }
    if (telefono.length !== 11 || telefono === "04000000000") {
        alert("❌ El número de teléfono no es válido");
        return false;
    }
    return true;
}

function validarPassword(pass) {
    if (pass === "") return true;
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!regex.test(pass)) {
        alert("❌ La contraseña debe tener al menos 8 caracteres, incluir letras, números y un carácter especial (@$!%*#?&)");
        return false;
    }
    return true;
}


if (edicionInfo) {
    titulo.innerText = "Editar Usuario";
    boton.innerText = "Guardar Cambios";
    boton.style.backgroundColor = "#c54b00";

    const d = edicionInfo.datos;

    inputNombre.value = d.nombre || "";
    inputApellido.value = d.apellido || "";
    inputUsuario.value = d.usuario || "";
    inputCedula.value = d.cedula || "";
    inputTelefono.value = d.telefono || "";
    if (selectRango) selectRango.value = d.rango || "";

    if (usuarioActivo && String(usuarioActivo.CI) !== String(d.cedula)) {
        const camposABloquear = [inputNombre, inputApellido, inputUsuario, inputTelefono, inputClave, inputCedula];

        camposABloquear.forEach(campo => {
            campo.readOnly = true;
            campo.tabIndex = "-1";
            campo.style.pointerEvents = "none";
            campo.style.backgroundColor = "#f2f2f2";
            campo.style.color = "#888";
        });
        inputClave.placeholder = "🔒 Bloqueado por seguridad";
    } else {
        inputCedula.readOnly = true;
        inputCedula.style.backgroundColor = "#f2f2f2";
        inputClave.placeholder = "Dejar en blanco para mantener clave actual";
    }

} else {
    titulo.innerText = "Registrar Personal";
    boton.innerText = "Registrar Usuario";
    inputClave.placeholder = "La clave será su C.I. por defecto";

    inputClave.readOnly = true;
    inputClave.tabIndex = "-1";
    inputClave.style.pointerEvents = "none";
    inputClave.style.backgroundColor = "#e9e9e9";
}

inputTelefono.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 11);
});


document.getElementById('formUsuario').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = inputNombre.value.trim();
    const apellido = inputApellido.value.trim();
    const cedula = inputCedula.value.trim();
    const telefono = inputTelefono.value.trim();
    const usuario = inputUsuario.value.trim();
    const rango = selectRango.value;
    let clave = inputClave.value;

    if (rango === "") return alert("⚠️ Debe seleccionar un rango.");
    if (!validarTelefono(telefono)) return;

    let enviarClave = true;
    if (edicionInfo) {
        if (inputClave.style.pointerEvents === "none" || clave === "") {
            enviarClave = false;
        } else {
            if (!validarPassword(clave)) return;
        }
    } else {
        clave = cedula;
    }

    const datosForm = {
        nombre,
        apellido,
        usuario,
        cedula,
        telefono,
        clave: enviarClave ? clave : null,
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
            alert("✅ Cambios realizados con éxito.");
            window.location.href = "../personal/per.html";
        } else {
            alert("❌ Error: " + resultado.message);
        }
    } catch (error) {
        alert("🚫 Error de conexión.");
    }
});