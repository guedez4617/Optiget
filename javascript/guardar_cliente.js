document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const activeElement = document.activeElement;
        const cedulaInput = document.getElementById('cedula');

        // Si el foco está en la cédula, ejecutamos la búsqueda
        if (activeElement === cedulaInput) {
            e.preventDefault(); // Evita enviar el formulario vacío
            buscarCliente();
        }
        // En cualquier otro campo, el Enter enviará el formulario por defecto (Submit)
    }
});

// --- FUNCIÓN PARA BUSCAR CLIENTE ---
async function buscarCliente() {
    const cedulaInput = document.getElementById('cedula').value.trim();
    if (!cedulaInput) return alert("Ingrese una cédula para buscar.");

    try {
        const response = await fetch(`../../../php/gestion_clientes.php?cedula=${cedulaInput}`);
        const datos = await response.json();

        if (datos.nuevo) {
            alert("Cliente no registrado. Complete los datos.");
            document.getElementById('nombre').value = "";
            document.getElementById('telefono').value = "";
            document.getElementById('direccion').value = "";
            document.getElementById('nombre').focus();
        } else {
            document.getElementById('nombre').value = datos.nombre || "";
            document.getElementById('telefono').value = datos.telefono || "";
            document.getElementById('direccion').value = datos.direccion || "";

            // Guardamos preventivamente para asegurar la persistencia
            localStorage.setItem("nombreClienteSeleccionado", datos.nombre);
            localStorage.setItem("cedulaClienteSeleccionado", cedulaInput);
            alert("Cliente encontrado y cargado.");

            // Ponemos el foco en el botón de guardar para que otro Enter finalice la compra
            document.querySelector('#formCliente button[type="submit"]').focus();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión.");
    }
}

// Evento para el clic en el botón físico de buscar
document.getElementById('btnBuscar').addEventListener('click', buscarCliente);

// --- GUARDAR Y REGRESAR (CONTINUAR COMPRA) ---
document.getElementById('formCliente').addEventListener('submit', async(e) => {
    e.preventDefault();

    const cedula = document.getElementById('cedula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();

    if (!cedula || !nombre) return alert("Cédula y Nombre son obligatorios.");

    const clienteParaEnviar = { cedula, nombre, telefono, direccion };

    try {
        const response = await fetch('../../../php/gestion_clientes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteParaEnviar)
        });

        const resultado = await response.json();

        if (resultado.status === "ok") {
            // ENVIAR DATOS A LA CAJA MEDIANTE LOCALSTORAGE
            localStorage.setItem("nombreClienteSeleccionado", nombre);
            localStorage.setItem("cedulaClienteSeleccionado", cedula);

            alert("Cliente listo. Regresando a la factura...");

            // IMPORTANTE: Verifica que esta ruta sea la correcta
            window.location.href = "../caja/principal.html";
        } else {
            alert("Error: " + resultado.mensaje);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al guardar.");
    }
});