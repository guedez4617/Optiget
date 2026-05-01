document.addEventListener("DOMContentLoaded", () => {
    cargarHistorial();

    const btnBuscar = document.querySelector(".btn-buscar");
    const inputBuscar = document.querySelector(".busqueda input");

    if (btnBuscar && inputBuscar) {
        btnBuscar.addEventListener("click", filtrarTabla);

        inputBuscar.addEventListener("keyup", (e) => {
            if (e.key === "Enter") filtrarTabla();
        });
    }
});

function filtrarTabla() {
    const valor = document.querySelector(".busqueda input").value.toLowerCase();
    const filas = document.querySelectorAll(".ventas-tabla tbody tr");

    filas.forEach(fila => {
        const textoFila = fila.innerText.toLowerCase();
        fila.style.display = textoFila.includes(valor) ? "" : "none";
    });
}

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
            const nombre = v.nombre_cliente ? v.nombre_cliente : "CLIENTE GENERAL";

            tr.innerHTML = `
                <td style="text-transform: uppercase; font-weight: bold;">${v.tipo_pago}</td>
                <td>${v.fecha}<br><small>${v.hora}</small></td>
                <td style="text-transform: uppercase;">${nombre}</td>
                <td>$${total}</td>
                <td>
                    <button class="icono-ver" onclick="verFactura(${v.Id_factura})" style="cursor:pointer; background:none; border:none; font-size:1.2rem;">⌕</button>
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
        const res = await fetch(`../../../php/obtener_detalle_venta.php?id=${id}`);
        const data = await res.json();

        if (data.status === "ok") {
            localStorage.removeItem("carritoTemporal");
            localStorage.removeItem("nombreClienteSeleccionado");
            localStorage.removeItem("cedulaClienteSeleccionado");
            localStorage.setItem("idFacturaReciente", id);
            localStorage.setItem("metodoPagoSeleccionado", data.cabecera.tipo_pago);
            localStorage.setItem("nombreClienteSeleccionado", data.cabecera.nombre_cliente || "CLIENTE GENERAL");
            localStorage.setItem("cedulaClienteSeleccionado", data.cabecera.ci_cliente || "999");
            localStorage.setItem("modoConsulta", "true");
            window.location.href = "../factra/fa.html";
        } else {
            alert("Error al recuperar detalle: " + data.mensaje);
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión al recuperar el detalle de la venta.");
    }
}