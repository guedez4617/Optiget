document.addEventListener("DOMContentLoaded", () => {
    cargarHistorial();

    // Lógica del Buscador
    const btnBuscar = document.querySelector(".btn-buscar");
    const inputBuscar = document.querySelector(".busqueda input");

    if (btnBuscar && inputBuscar) {
        btnBuscar.addEventListener("click", () => {
            const valor = inputBuscar.value.toLowerCase();
            const filas = document.querySelectorAll(".ventas-tabla tbody tr");

            filas.forEach(fila => {
                const textoFila = fila.innerText.toLowerCase();
                fila.style.display = textoFila.includes(valor) ? "" : "none";
            });
        });
    }
});

async function cargarHistorial() {
    try {
        const res = await fetch("../../../php/obtener_historial.php");
        const ventas = await res.json();

        const tbody = document.querySelector(".ventas-tabla tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (ventas.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No hay ventas registradas</td></tr>";
            return;
        }

        ventas.forEach(v => {
            const tr = document.createElement("tr");
            const total = v.total_venta ? parseFloat(v.total_venta).toFixed(2) : "0.00";
            // El nombre aquí viene del JOIN inicial para la tabla rápida
            const nombre = v.nombre_cliente ? v.nombre_cliente : "CLIENTE GENERAL";

            tr.innerHTML = `
                <td style="text-transform: uppercase; font-weight: bold;">${v.tipo_pago}</td>
                <td>${v.fecha}<br><small>${v.hora}</small></td>
                <td>${nombre}</td>
                <td>$${total}</td>
                <td>
                    <a href="#" class="icono-ver" onclick="verFactura(${v.Id_factura})">⌕</a>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("Error al cargar el historial:", e);
    }
}

async function verFactura(id) {
    try {
        // Consultamos el detalle que ahora incluye la búsqueda de cliente por DB
        const res = await fetch(`../../../php/obtener_detalle_venta.php?id=${id}`);
        const data = await res.json();

        if (data.status === "ok") {
            // Guardamos los datos recuperados de la DB en el LocalStorage
            localStorage.setItem("idFacturaReciente", data.cabecera.id);
            localStorage.setItem("ultimaVenta", JSON.stringify(data.productos));
            localStorage.setItem("metodoPagoSeleccionado", data.cabecera.tipo_pago);

            // Guardamos los datos del cliente que el PHP buscó por C.I.
            localStorage.setItem("clienteActual", JSON.stringify({
                cedula: data.cabecera.ci_cliente,
                nombre: data.cabecera.nombre_cliente
            }));

            // Activamos el modo atrás
            localStorage.setItem("modoConsulta", "true");

            window.location.href = "../factra/fa.html";
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (e) {
        alert("Error de conexión al recuperar el detalle");
    }
}