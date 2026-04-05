document.addEventListener("DOMContentLoaded", () => {
    const idFactura = localStorage.getItem("idFacturaReciente");
    const esConsulta = localStorage.getItem("modoConsulta");

    if (!idFactura || idFactura === "undefined") {
        console.error("No se encontró el ID de la factura");
        return;
    }
    cargarDatos(idFactura, esConsulta);
});

async function cargarDatos(id, esConsulta) {
    try {
        const res = await fetch(`../../../php/obtener_detalle_venta.php?id=${id}`);
        const data = await res.json();

        if (data.status === "ok") {
            const c = data.cabecera;

            const llenar = (idEl, texto) => {
                const el = document.getElementById(idEl);
                if (el) el.textContent = texto || "---";
            };

            // Llenado de cabecera
            llenar("fechaFactura", c.fecha);
            llenar("horaFactura", c.hora);
            llenar("facNombre", c.nombre_cliente);
            llenar("facCedula", c.ci_cliente);
            llenar("facMetodo", c.tipo_pago);
            llenar("facTelefono", c.telefono);
            llenar("facDireccion", c.residencia);
            llenar("empleado", c.empleado);

            // Llenado de tabla de productos
            const tabla = document.getElementById("cuerpoFactura");
            if (tabla) {
                let totalVenta = 0;
                tabla.innerHTML = "";

                data.productos.forEach(p => {
                    totalVenta += p.subtotal;

                    // LÓGICA DEL IVA: 
                    // Verificamos si p.iva viene como 1, "Si", true o mayor a 0
                    const tieneIva = (p.iva == 1 || p.iva == "Si" || p.iva == "1") ? "Sí" : "No";

                    // Se añade la celda de IVA al lado de subtotal
                    tabla.innerHTML += `
                        <tr>
                            <td>${p.cantidadFactura}</td>
                            <td>${p.codigo || '---'}</td> 
                            <td>${p.nombre}</td>
                            <td>$${p.precio.toFixed(2)}</td>
                            <td>$${p.subtotal.toFixed(2)}</td>
                            <td style="text-align: center;">${tieneIva}</td>
                        </tr>`;
                });

                llenar("facTotal", totalVenta.toFixed(2));
            }

            configurarBotonSalida();

        } else {
            alert("Error del servidor: " + data.mensaje);
        }
    } catch (e) {
        console.error("Error al procesar:", e);
        alert("Error al cargar los datos de la factura.");
    }
}

/**
 * Función que detecta la procedencia y ajusta el botón "Nueva Venta"
 */
function configurarBotonSalida() {
    const vieneDeHistorial = document.referrer.includes("his.html");
    const btnAccion = document.querySelector("button[onclick='nuevaVenta()']");

    if (btnAccion) {
        if (vieneDeHistorial) {
            btnAccion.textContent = "Atrás al Historial";
            btnAccion.onclick = (e) => {
                e.preventDefault();
                window.location.href = "../historial_ventas/his.html";
            };
        } else {
            btnAccion.textContent = "Nueva Venta";
            btnAccion.onclick = (e) => {
                e.preventDefault();
                nuevaVenta();
            };
        }
    }
}

function nuevaVenta() {
    localStorage.removeItem("idFacturaReciente");
    localStorage.removeItem("modoConsulta");
    window.location.href = "../caja/principal.html";
}