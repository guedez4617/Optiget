/**
 * Variables para rastrear el estado original del cliente
 */
let clienteExistente = false;
let datosOriginales = { nombre: "", telefono: "", direccion: "" };

/**
 * Función central de validaciones
 */
function validarDatosCliente(cedula, nombre, telefono) {
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const regexNumeros = /^[0-9]+$/;

    if (!regexNumeros.test(cedula) || cedula.length < 6 || /^0+$/.test(cedula)) {
        alert("⚠️ C.I. inválida (Mínimo 6 dígitos, solo números y no puede ser 0).");
        return false;
    }
    if (nombre !== "" && !regexLetras.test(nombre)) {
        alert("⚠️ El nombre solo puede contener letras.");
        return false;
    }
    if (telefono !== "") {
        if (telefono.length !== 11 || !telefono.startsWith("04") || !regexNumeros.test(telefono)) {
            alert("⚠️ Teléfono inválido (11 dígitos, debe empezar por 04).");
            return false;
        }
    }
    return true;
}

/**
 * BUSCAR CLIENTE AUTOMÁTICAMENTE
 */
document.getElementById('cedula').addEventListener('blur', async() => {
    const cedulaInput = document.getElementById('cedula').value.trim();
    if (cedulaInput.length < 6) return;

    try {
        const response = await fetch(`../../../php/gestion_clientes.php?cedula=${cedulaInput}`);
        const datos = await response.json();

        if (!datos.nuevo) {
            // Guardamos los datos originales para comparar después
            datosOriginales = {
                nombre: datos.nombre || "",
                telefono: datos.telefono || "",
                direccion: datos.direccion || ""
            };

            document.getElementById('nombre').value = datosOriginales.nombre;
            document.getElementById('telefono').value = datosOriginales.telefono;
            document.getElementById('direccion').value = datosOriginales.direccion;

            clienteExistente = true;
        } else {
            clienteExistente = false;
            datosOriginales = { nombre: "", telefono: "", direccion: "" };
        }
    } catch (error) {
        console.error("Error en búsqueda automática:", error);
    }
});

/**
 * GUARDAR Y CONTINUAR (Confirmación solo si hubo cambios)
 */
document.getElementById('formCliente').addEventListener('submit', async(e) => {
    e.preventDefault();

    const cedula = document.getElementById('cedula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();

    if (!cedula || !nombre) return alert("Cédula y Nombre son obligatorios.");
    if (!validarDatosCliente(cedula, nombre, telefono)) return;

    // --- LÓGICA DE DETECCIÓN DE CAMBIOS ---
    if (clienteExistente) {
        const huboCambios =
            nombre !== datosOriginales.nombre ||
            telefono !== datosOriginales.telefono ||
            direccion !== datosOriginales.direccion;

        if (huboCambios) {
            const confirmar = confirm("📝 Has modificado los datos del cliente. ¿Deseas actualizar su información en la base de datos?");
            if (!confirmar) {
                alert("Operación cancelada. Se mantendrán los datos anteriores.");
                return; // Detiene el envío
            }
        }
    }

    // --- ENVÍO AL SERVIDOR ---
    const clienteParaEnviar = { cedula, nombre, telefono, direccion };

    try {
        const response = await fetch('../../../php/gestion_clientes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteParaEnviar)
        });

        const resultado = await response.json();

        if (resultado.status === "ok") {
            localStorage.setItem("nombreClienteSeleccionado", nombre);
            localStorage.setItem("cedulaClienteSeleccionado", cedula);
            window.location.href = "../caja/principal.html";
        } else {
            alert("Error: " + resultado.mensaje);
        }
    } catch (error) {
        alert("Error al procesar el registro.");
    }
});