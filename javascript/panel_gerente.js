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
    // Dibujar gráficos usando Canvas para trabajo offline (reemplaza Chart.js)
    const canvasD = document.getElementById('graficaDinero');
    if (canvasD) {
        const ctxD = canvasD.getContext('2d');
        drawDoughnut(ctxD, data.valoresMetodos || [], data.labelsMetodos || []);
        renderLegend('legendDinero', data.labelsMetodos || [], data.valoresMetodos || []);
        attachTooltipDoughnut(canvasD, data.valoresMetodos || [], data.labelsMetodos || [], document.getElementById('tooltipDinero'));
    }

    const canvasP = document.getElementById('graficaProductos');
    if (canvasP) {
        const ctxP = canvasP.getContext('2d');
        drawBar(ctxP, data.productosNombres || [], data.productosCantidades || []);
        renderLegend('legendProductos', data.productosNombres || [], data.productosCantidades || []);
        attachTooltipBar(canvasP, data.productosNombres || [], data.productosCantidades || [], document.getElementById('tooltipProductos'));
    }
}

// Tooltip helpers
function attachTooltipDoughnut(canvas, values, labels, tooltipEl) {
    if (!canvas || !tooltipEl) return;
    const rect = () => canvas.getBoundingClientRect();
    canvas.onmousemove = function(e) {
        const r = rect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const cx = canvas.clientWidth / 2,
            cy = canvas.clientHeight / 2;
        const dx = x - cx,
            dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const segs = canvas._segments || [];
        if (!segs.length) { tooltipEl.style.display = 'none'; return; }
        const inner = segs[0].inner,
            outer = segs[0].outer;
        if (dist < inner || dist > outer) { tooltipEl.style.display = 'none';
            redrawDoughnutHighlight(canvas, -1); return; }
        let angle = Math.atan2(dy, dx);
        if (angle < -Math.PI / 2) angle += Math.PI * 2;
        for (let i = 0; i < segs.length; i++) {
            const s = segs[i];
            if (angle >= s.start && angle < s.end) {
                tooltipEl.style.display = 'block';
                tooltipEl.textContent = `${s.label}: ${s.value}`;
                tooltipEl.style.left = `${x}px`;
                tooltipEl.style.top = `${y}px`;
                redrawDoughnutHighlight(canvas, i);
                return;
            }
        }
        tooltipEl.style.display = 'none';
        redrawDoughnutHighlight(canvas, -1);
    };
    canvas.onmouseleave = function() { tooltipEl.style.display = 'none';
        redrawDoughnutHighlight(canvas, -1); };
}

function attachTooltipBar(canvas, labels, values, tooltipEl) {
    if (!canvas || !tooltipEl) return;
    const rect = () => canvas.getBoundingClientRect();
    canvas.onmousemove = function(e) {
        const r = rect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const bars = canvas._bars || [];
        if (!bars.length) { tooltipEl.style.display = 'none';
            redrawBarHighlight(canvas, -1); return; }
        for (let i = 0; i < bars.length; i++) {
            const b = bars[i];
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                tooltipEl.style.display = 'block';
                tooltipEl.textContent = `${b.label}: ${b.value}`;
                tooltipEl.style.left = `${x}px`;
                tooltipEl.style.top = `${y}px`;
                redrawBarHighlight(canvas, i);
                return;
            }
        }
        tooltipEl.style.display = 'none';
        redrawBarHighlight(canvas, -1);
    };
    canvas.onmouseleave = function() { tooltipEl.style.display = 'none';
        redrawBarHighlight(canvas, -1); };
}

// redraw helpers to highlight hovered segment/bar
function redrawDoughnutHighlight(canvas, hoverIndex) {
    const segs = canvas._segments || [];
    if (!segs.length) return;
    const ctx = canvas.getContext('2d');
    const values = segs.map(s => s.value);
    const colors = segs.map(s => s.color);
    const DPR = window.devicePixelRatio || 1;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const cx = canvas.clientWidth / 2,
        cy = canvas.clientHeight / 2;
    const radius = Math.min(cx, cy) * 0.8;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    let start = -Math.PI / 2;
    const total = values.reduce((s, v) => s + v, 0) || 1;
    for (let i = 0; i < values.length; i++) {
        const val = values[i];
        const angle = (val / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const outer = (i === hoverIndex) ? radius * 1.03 : radius;
        ctx.arc(cx, cy, outer, start, start + angle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        start += angle;
    }
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
}

function redrawBarHighlight(canvas, hoverIndex) {
    const bars = canvas._bars || [];
    if (!bars.length) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const padding = 30;
    const chartW = canvas.clientWidth - padding * 2;
    const chartH = canvas.clientHeight - padding * 2;
    // redraw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartH);
    ctx.lineTo(padding + chartW, padding + chartH);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
    for (let i = 0; i < bars.length; i++) {
        const b = bars[i];
        if (i === hoverIndex) {
            ctx.fillStyle = shadeColor(b.color, -10);
            ctx.fillRect(b.x, b.y - 6, b.w, b.h + 6);
        } else {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.w, b.h);
        }
    }
}

// small helper to slightly darken/lighten color
function shadeColor(col, percent) {
    const num = parseInt(col.slice(1), 16);
    const r = Math.max(Math.min(((num >> 16) + percent), 255), 0);
    const g = Math.max(Math.min((((num >> 8) & 0x00FF) + percent), 255), 0);
    const b = Math.max(Math.min(((num & 0x0000FF) + percent), 255), 0);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function renderLegend(containerId, labels, values) {
    const colors = ['#28a745', '#007bff', '#ffc107', '#17a2b8', '#6610f2', '#c54b00', '#6f42c1'];
    const cont = document.getElementById(containerId);
    if (!cont) return;
    cont.innerHTML = '';
    for (let i = 0; i < labels.length; i++) {
        const item = document.createElement('div');
        item.className = 'item';
        const sw = document.createElement('span');
        sw.className = 'swatch';
        sw.style.background = colors[i % colors.length];
        const txt = document.createElement('span');
        txt.textContent = `${labels[i]} (${values[i]})`;
        item.appendChild(sw);
        item.appendChild(txt);
        cont.appendChild(item);
    }
}

// --- Simple renderer de gráficos (funciona sin librerías externas) ---
function drawDoughnut(ctx, values, labels) {
    const canvas = ctx.canvas;
    const DPR = window.devicePixelRatio || 1;
    // set proper backing store size
    canvas.width = Math.max(300, canvas.clientWidth) * DPR;
    canvas.height = Math.max(200, canvas.clientHeight) * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const total = values.reduce((s, v) => s + (Number(v) || 0), 0) || 1;
    const colors = ['#28a745', '#007bff', '#ffc107', '#17a2b8', '#6610f2', '#c54b00', '#6f42c1'];
    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;
    const radius = Math.min(cx, cy) * 0.8;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    let start = -Math.PI / 2;
    // store segments for hit testing
    canvas._segments = [];
    for (let i = 0; i < values.length; i++) {
        const val = Number(values[i]) || 0;
        const angle = (val / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, start + angle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        canvas._segments.push({ start, end: start + angle, label: labels[i], value: val, color: colors[i % colors.length], inner: radius * 0.55, outer: radius });
        start += angle;
    }
    // agujero central
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // No dibujar leyenda en el canvas: usamos la leyenda HTML debajo del canvas
}

function drawBar(ctx, labels, values) {
    const canvas = ctx.canvas;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = Math.max(300, canvas.clientWidth) * DPR;
    canvas.height = Math.max(200, canvas.clientHeight) * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const padding = 30;
    const chartW = canvas.clientWidth - padding * 2;
    const chartH = canvas.clientHeight - padding * 2;
    const maxVal = Math.max(...values.map(v => Number(v) || 0), 1);
    const barW = chartW / Math.max(labels.length, 1) * 0.7;
    const gap = (chartW - (barW * labels.length)) / Math.max(labels.length - 1, 1);
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    // ejes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartH);
    ctx.lineTo(padding + chartW, padding + chartH);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
    // barras
    const colors = ['#28a745', '#007bff', '#ffc107', '#17a2b8', '#6610f2', '#c54b00', '#6f42c1'];
    // store bar geometry for hit testing
    canvas._bars = [];
    for (let i = 0; i < labels.length; i++) {
        const val = Number(values[i]) || 0;
        const h = (val / maxVal) * (chartH - 10);
        const x = padding + i * (barW + gap);
        const y = padding + chartH - h;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, barW, h);
        canvas._bars.push({ x, y, w: barW, h, label: labels[i], value: val, color: colors[i % colors.length] });
        // No dibujar etiquetas debajo de las columnas: la leyenda HTML muestra los nombres
    }
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