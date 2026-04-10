const edicionInfo = JSON.parse(localStorage.getItem('usuarioAEditar'));
const titulo = document.getElementById('tituloPantalla');
const boton = document.getElementById('btnAccion');

// Rellenar los datos si existen los dato en localStorage para editar
if (edicionInfo) {
    titulo.innerText = "Editar Usuario";
    boton.innerText = "Guardar Cambios";
    boton.style.backgroundColor = "#c54b00";

    const d = edicionInfo.datos;
    document.getElementById('nombre').value = d.nombre || "";
    document.getElementById('apellido').value = d.apellido || "";
    document.getElementById('usuario').value = d.usuario;
    document.getElementById('cedula').value = d.cedula;
    document.getElementById('cedula').readOnly = true; // No editar la llave primaria
    document.getElementById('telefono').value = d.telefono;
    document.getElementById('clave').value = d.clave;
    document.getElementById('rango').value = d.rango;
}

// MANEJO DEL ENVÍO
document.getElementById('formUsuario').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Recolectar datos del HTML
    const datosForm = {
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        usuario: document.getElementById('usuario').value.trim(),
        cedula: document.getElementById('cedula').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        clave: document.getElementById('clave').value,
        rango: document.getElementById('rango').value
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
            window.location.href = "../personal/per.html";
        } else {
            alert("Error del servidor: " + resultado.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión al guardar.");
    }
});