document.addEventListener("DOMContentLoaded", () => {
    const idFactura = localStorage.getItem("idFacturaReciente");
    if (idFactura) cargarDatosFactura(idFactura);

    // LÓGICA DEL BOTÓN DINÁMICO
    const btnRegresar = document.getElementById("btnNuevaVenta");
    if (btnRegresar) {
        // Verificamos si venimos del historial
        if (document.referrer.includes("his.html") || document.referrer.includes("historial")) {
            btnRegresar.textContent = "Volver al Historial";
            btnRegresar.onclick = () => {
                window.location.href = "../historial_ventas/his.html";
            };
        } else {
            // Comportamiento por defecto (ir a facturación)
            btnRegresar.textContent = "Nueva Venta";
            btnRegresar.onclick = () => {
                window.location.href = "../caja/principal.html";
            };
        }
    }
});

async function cargarDatosFactura(id) {
    try {
        const res = await fetch(`../../../php/obtener_detalle_venta.php?id=${id}`);
        const data = await res.json();

        if (data.status === "ok") {
            const cab = data.cabecera;
            const productos = data.productos;

            // Datos Cliente
            document.getElementById("nombreCliente").textContent = cab.nombre_cliente || "Cliente General";
            document.getElementById("rifCliente").textContent = cab.ci_cliente || "V-00000000";
            document.getElementById("telfCliente").textContent = cab.telefono || "---";
            document.getElementById("dirCliente").textContent = cab.residencia || "---";

            // Datos Factura
            document.getElementById("nroFactura").textContent = `${String(id).padStart(6, '0')}`;
            document.getElementById("fechaFactura").textContent = `${cab.fecha} ${cab.hora}`;
            document.getElementById("metodoPago").textContent = cab.tipo_pago;
            document.getElementById("vendedor").textContent = cab.empleado;

            const tablaBody = document.getElementById("listaProductos");
            tablaBody.innerHTML = "";

            let acumSub = 0;
            let acumIva = 0;
            let acumTotalBs = 0; // Nueva variable para sumar los Bs de la base de datos

            productos.forEach(p => {
                const cant = parseFloat(p.cantidadFactura) || 0;
                const subFila = parseFloat(p.subtotal_base) || 0;
                const precioU = cant > 0 ? (subFila / cant) : 0;

                // Obtenemos el total_bs que guardamos en la base de datos
                const totalBsFila = parseFloat(p.total_bs) || 0;

                const tieneIva = (p.tiene_iva == 1 || p.tiene_iva == "Si");
                const ivaFila = tieneIva ? (subFila * 0.16) : 0;
                const totalFila = subFila + ivaFila;

                acumSub += subFila;
                acumIva += ivaFila;
                acumTotalBs += totalBsFila; // Sumamos el valor real guardado

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

            // Totales
            const finalUSD = acumSub + acumIva;
            document.getElementById("subtotal").textContent = acumSub.toFixed(2);
            document.getElementById("iva").textContent = acumIva.toFixed(2);
            document.getElementById("totalFinal").textContent = finalUSD.toFixed(2);

            // USAMOS EL ACUMULADO DE LA BASE DE DATOS, NO LA TASA ACTUAL
            document.getElementById("totalBs").textContent = acumTotalBs.toFixed(2) + " Bs";

        }
    } catch (e) { console.error(e); }
}