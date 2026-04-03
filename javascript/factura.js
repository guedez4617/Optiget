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

            // Función para evitar errores si falta algún ID
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
                    // Se mantiene la estructura de 5/6 columnas según tu tabla HTML
                    tabla.innerHTML += `
                        <tr>
                            <td>${p.cantidadFactura}</td>
                            <td>${p.codigo || '---'}</td> 
                            <td>${p.nombre}</td>
                            <td>$${p.precio.toFixed(2)}</td>
                            <td>$${p.subtotal.toFixed(2)}</td>
                        </tr>`;
                });

                llenar("facTotal", totalVenta.toFixed(2));
            }

            // --- CONFIGURACIÓN DINÁMICA DEL BOTÓN ---
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
    // Detectamos si el usuario viene de la página de historial
    const vieneDeHistorial = document.referrer.includes("his.html");

    // Buscamos el botón por su texto o por su atributo onclick
    const btnAccion = document.querySelector("button[onclick='nuevaVenta()']");

    if (btnAccion) {
        if (vieneDeHistorial) {
            // Cambiamos el comportamiento para el Historial
            btnAccion.textContent = "Atrás al Historial";
            btnAccion.onclick = (e) => {
                e.preventDefault(); // Evitamos la ejecución de la función original
                window.location.href = "../historial_ventas/his.html";
            };
        } else {
            // Comportamiento normal para una venta recién hecha
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