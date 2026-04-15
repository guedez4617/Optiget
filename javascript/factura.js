document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtenemos el ID de la factura a mostrar
    const idFactura = localStorage.getItem("idFacturaReciente");
    if (idFactura) {
        cargarDatosFactura(idFactura);
    }

    // 2. Lógica del botón de retorno
    const btnRegresar = document.getElementById("btnNuevaVenta");
    if (btnRegresar) {
        if (document.referrer.includes("his.html") || document.referrer.includes("historial")) {
            btnRegresar.textContent = "Volver al Historial";
            btnRegresar.onclick = () => {
                window.location.href = "../historial_ventas/his.html";
            };
        } else {
            btnRegresar.textContent = "Nueva Venta";
            btnRegresar.onclick = () => {
                window.location.href = "../caja/principal.html";
            };
        }
    }
});

// Busca el id de la factura y carga TODO (incluyendo el encabezado histórico)
async function cargarDatosFactura(id) {
    try {
        const res = await fetch(`../../../php/obtener_detalle_venta.php?id=${id}`);
        const data = await res.json();

        if (data.status === "ok") {
            const cab = data.cabecera;
            const productos = data.productos;

            // --- A. DATOS DEL NEGOCIO (HISTÓRICOS) ---
            // Estos vienen del JOIN con la tabla datos_negocio en el PHP
            document.getElementById('negocioNombre').textContent = cab.emp_nombre || "Bodegón Don Diego";
            document.getElementById('negocioDireccion').textContent = cab.emp_dir || "";
            document.getElementById('negocioRif').textContent = cab.emp_rif || "";
            document.getElementById('negocioTel').textContent = cab.emp_tel || "";

            // --- B. DATOS DEL CLIENTE ---
            document.getElementById("nombreCliente").textContent = cab.nombre_cliente || "Cliente General";
            document.getElementById("rifCliente").textContent = cab.ci_cliente || "V-00000000";
            document.getElementById("telfCliente").textContent = cab.telefono || "---";
            document.getElementById("dirCliente").textContent = cab.direccion || "---";

            // --- C. DATOS DE LA FACTURA ---
            document.getElementById("nroFactura").textContent = `${String(id).padStart(6, '0')}`;
            document.getElementById("fechaFactura").textContent = `${cab.fecha} ${cab.hora}`;
            document.getElementById("metodoPago").textContent = cab.tipo_pago;

            const vendedorReal = cab.nombre_vendedor ? `${cab.nombre_vendedor} ${cab.apellido_vendedor}` : "S/V";
            document.getElementById("vendedor").textContent = vendedorReal;

            // --- D. DETALLE DE PRODUCTOS ---
            const tablaBody = document.getElementById("listaProductos");
            tablaBody.innerHTML = "";

            let acumSub = 0;
            let acumIva = 0;
            let acumTotalBs = 0;

            productos.forEach(p => {
                const cant = parseFloat(p.cantidadFactura) || 0;
                const subFila = parseFloat(p.subtotal_base) || 0;
                const precioU = cant > 0 ? (subFila / cant) : 0;
                const totalBsFila = parseFloat(p.total_bs) || 0;

                const tieneIva = (p.tiene_iva == 1 || p.tiene_iva == "Si" || p.tiene_iva == "si");
                const ivaFila = tieneIva ? (subFila * 0.16) : 0;
                const totalFila = subFila + ivaFila;

                acumSub += subFila;
                acumIva += ivaFila;
                acumTotalBs += totalBsFila;

                tablaBody.innerHTML += `
                    <tr>
                        <td>${p.codigo_producto}</td>
                        <td style="text-align: left;">${p.nombre_prod}</td>
                        <td style="text-align: left;">${p.presentacion_prod || '---'}</td>
                        <td>${cant}</td>
                        <td>${precioU.toFixed(2)}</td>
                        <td>${subFila.toFixed(2)}</td>
                        <td>${ivaFila.toFixed(2)}</td>
                        <td>${totalFila.toFixed(2)}</td>
                    </tr>
                `;
            });

            // --- E. TOTALES ---
            const finalUSD = acumSub + acumIva;
            document.getElementById("subtotal").textContent = acumSub.toFixed(2);
            document.getElementById("iva").textContent = acumIva.toFixed(2);
            document.getElementById("totalFinal").textContent = finalUSD.toFixed(2);
            document.getElementById("totalBs").textContent = acumTotalBs.toFixed(2) + " Bs";
        }
    } catch (e) {
        console.error("Error al cargar datos de la factura:", e);
    }
}