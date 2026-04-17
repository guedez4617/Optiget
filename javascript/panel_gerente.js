let chartDinero = null;
let chartProductos = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosPanel('1dia');

    const btnAbrir = document.getElementById('btnAuditoria');
    const modal = document.getElementById('modalAuditoria');
    const btnCerrar = document.getElementById('cerrarAuditoria');

    if (btnAbrir) {
        btnAbrir.onclick = () => {
            modal.style.display = 'flex';
            cargarAuditoriaGeneral();
        };
    }

    if (btnCerrar) {
        btnCerrar.onclick = () => (modal.style.display = 'none');
    }
});

window.cambiarFiltro = function(periodo, btn) {
    document.querySelectorAll('.btn-segment').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cargarDatosPanel(periodo);
};

async function cargarDatosPanel(periodo) {
    try {
        const response = await fetch(`../../../php/obtener_datos_panel.php?periodo=${periodo}`);
        const data = await response.json();

        document.getElementById('totalVentas').innerText = `$ ${data.totalVentas}`;
        document.getElementById('totalCredito').innerText = `$ ${data.totalCreditoPeriodo}`;
        document.getElementById('creditosActivos').innerText = `$ ${data.totalGlobalCredito}`;

        actualizarGraficas(data);
    } catch (e) { console.error("Error en dashboard", e); }
}

function actualizarGraficas(data) {
    const ctxD = document.getElementById('graficaDinero').getContext('2d');
    if (chartDinero) chartDinero.destroy();
    chartDinero = new Chart(ctxD, {
        type: 'doughnut',
        data: {
            labels: data.labelsMetodos,
            datasets: [{ data: data.valoresMetodos, backgroundColor: ['#28a745', '#007bff', '#ffc107', '#17a2b8', '#6610f2'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctxP = document.getElementById('graficaProductos').getContext('2d');
    if (chartProductos) chartProductos.destroy();
    chartProductos = new Chart(ctxP, {
        type: 'bar',
        data: {
            labels: data.productosNombres,
            datasets: [{ label: 'Ventas', data: data.productosCantidades, backgroundColor: '#c54b00' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

async function cargarAuditoriaGeneral() {
    const contenedor = document.getElementById('contenedorResultadosAuditoria');
    contenedor.innerHTML = `<table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalles</th></tr></thead><tbody id="tablaAuditoriaBody"></tbody></table>`;

    try {
        const res = await fetch('../../../php/obtener_auditoria.php');
        const logs = await res.json();
        document.getElementById('tablaAuditoriaBody').innerHTML = logs.map(log => `
            <tr>
                <td>${new Date(log.fecha).toLocaleString()}</td>
                <td><b>${log.NOMBRE}</b></td>
                <td><span style="background:#eee; padding:3px 8px; border-radius:4px;">${log.accion}</span></td>
                <td>${log.detalles}</td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

async function ejecutarAuditoriaDetallada() {
    const ci = document.getElementById('inputCI').value;
    const contenedor = document.getElementById('contenedorResultadosAuditoria');

    if (!ci) return alert("Ingrese una C.I.");

    contenedor.innerHTML = "<p style='text-align:center;'>Generando historial unificado...</p>";

    try {
        const response = await fetch(`../../../php/obtener_detalle_auditoria.php?ci=${ci}`);
        const sesiones = await response.json();

        if (sesiones.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center;'>Sin actividad registrada.</p>";
            return;
        }

        let htmlHeader = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:#f0f7ff; padding:10px; border-radius:8px;">
                <span style="font-weight:bold; color:#0056b3;">Resultado para C.I: ${ci}</span>
                <button onclick="imprimirSeccion('all')" class="btn-auditoria" style="background:#28a745; font-size:12px;">Imprimir Todo el Historial</button>
            </div>
        `;

        let htmlContenido = sesiones.map((sesion, index) => {
            let movimientosHtml = sesion.movimientos.map(m => {
                let claseColor = (m.accion === 'VENTA') ? 'tag-venta' :
                    (m.accion === 'ABONO') ? 'tag-abono' :
                    (m.accion === 'NEGOCIO') ? 'tag-negocio' : 'tag-historial';

                if (m.accion.includes('HABILITAR') || m.accion.includes('ACTIVAR')) claseColor = 'tag-venta';

                return `
                    <div style="padding:8px; border-bottom:1px solid #eee; font-size:13px;">
                        <span class="accion-tag ${claseColor}">${m.accion}</span>
                        <b>[${new Date(m.fecha_completa).toLocaleTimeString()}]</b> ${m.detalles}
                    </div>`;
            }).join('');

            const idSesion = `sesion_print_${index}`;

            return `
                <div id="${idSesion}" class="card-sesion-print" style="border:1px solid #ccc; margin-bottom:20px; border-radius:8px; background:white; overflow:hidden;">
                    <div style="background:#343a40; color:white; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:13px;">Inicio: ${new Date(sesion.inicio).toLocaleString()} | Fin: ${sesion.fin}</span>
                        <button class="no-print" onclick="imprimirSeccion('${idSesion}')" style="cursor:pointer; background:#6c757d; border:none; color:white; padding:4px 8px; border-radius:4px; font-size:11px;">Imprimir esta sesión</button>
                    </div>
                    <div style="padding:10px;">${movimientosHtml || '<i style="color:gray;">No hubo movimientos en esta sesión.</i>'}</div>
                </div>`;
        }).join('');

        contenedor.innerHTML = htmlHeader + htmlContenido;

    } catch (error) { contenedor.innerHTML = "<p>Error de conexión.</p>"; }
}

function imprimirSeccion(id) {
    let contenidoParaImprimir = "";
    const ci = document.getElementById('inputCI').value;

    if (id === 'all') {
        const tempDiv = document.getElementById('contenedorResultadosAuditoria').cloneNode(true);
        tempDiv.querySelectorAll('button').forEach(b => b.remove());
        contenidoParaImprimir = tempDiv.innerHTML;
    } else {

        const sesionDiv = document.getElementById(id).cloneNode(true);
        sesionDiv.querySelectorAll('button').forEach(b => b.remove()); // Quitar botón de la copia
        contenidoParaImprimir = sesionDiv.innerHTML;
    }

    const ventanaPrint = window.open('', '', 'height=700,width=900');
    ventanaPrint.document.write('<html><head><title>Reporte Don Diego</title>');
    ventanaPrint.document.write(`
        <style>
            body { font-family: "Segoe UI", sans-serif; padding: 30px; }
            .accion-tag { padding: 3px 7px; border-radius: 4px; color: white; font-size: 11px; font-weight: bold; margin-right: 8px; display: inline-block; min-width: 65px; text-align: center; }
            .tag-venta { background: #28a745; }
            .tag-abono { background: #17a2b8; }
            .tag-historial { background: #007bff; }
            .tag-negocio { background: #6f42c1; }
            .card-sesion-print { border: 1px solid #444; margin-bottom: 20px; page-break-inside: avoid; }
            h1 { color: #c54b00; border-bottom: 2px solid #eee; }
            .no-print { display: none !important; }
        </style>
    `);
    ventanaPrint.document.write('</head><body>');
    ventanaPrint.document.write(`<h1>Auditoría de Usuario - C.I: ${ci}</h1>`);
    ventanaPrint.document.write(contenidoParaImprimir);
    ventanaPrint.document.write('</body></html>');

    ventanaPrint.document.close();
    ventanaPrint.focus();

    setTimeout(() => {
        ventanaPrint.print();
        ventanaPrint.close();
    }, 500);
}