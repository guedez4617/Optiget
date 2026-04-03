// --- FUNCIÓN PARA BUSCAR CLIENTE ---
document.getElementById('btnBuscar').addEventListener('click', async() => {
    const cedulaInput = document.getElementById('cedula').value.trim();
    if (!cedulaInput) return alert("Por favor, ingrese la cédula.");

    try {
        const response = await fetch(`../../../php/gestion_clientes.php?cedula=${cedulaInput}`);
        const datos = await response.json();

        if (datos.nuevo) {
            alert("El cliente no existe. Ingrese los datos para registrarlo.");
            // Limpiar campos para nuevo registro (manteniendo la cédula)
            document.getElementById('nombre').value = "";
            document.getElementById('telefono').value = "";
            document.getElementById('correo').value = "";
            document.getElementById('direccion').value = "";
        } else {
            // Rellenar campos con lo que devolvió la DB
            document.getElementById('nombre').value = datos.nombre;
            document.getElementById('telefono').value = datos.telefono;
            document.getElementById('correo').value = datos.correo;
            document.getElementById('direccion').value = datos.direccion;
            alert("Cliente cargado correctamente.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servidor.");
    }
});

// --- FUNCIÓN PARA GUARDAR Y REGRESAR A CAJA ---
document.getElementById('formCliente').addEventListener('submit', async(e) => {
    e.preventDefault();

    const clienteParaEnviar = {
        cedula: document.getElementById('cedula').value.trim(),
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        correo: document.getElementById('correo').value,
        direccion: document.getElementById('direccion').value
    };

    if (!clienteParaEnviar.cedula || !clienteParaEnviar.nombre) {
        return alert("Cédula y Nombre son campos obligatorios.");
    }

    try {
        const response = await fetch('../../../php/gestion_clientes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteParaEnviar)
        });

        const resultado = await response.json();

        if (resultado.status === "ok") {
            // Guardamos en LocalStorage para uso inmediato en la factura
            localStorage.setItem("clienteActual", JSON.stringify(clienteParaEnviar));

            alert(resultado.mensaje);
            // Redirigir a la pantalla de facturación
            window.location.href = "../caja/principal.html";
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al guardar los datos.");
    }
});