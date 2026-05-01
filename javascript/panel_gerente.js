let chartDinero = null;
let chartProductos = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosPanel('1dia');
});

let periodoActual = '1dia';

window.cambiarFiltro = function(periodo, btn) {
    document.querySelectorAll('.btn-segment').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    periodoActual = periodo;
    cargarDatosPanel(periodo);
};

window.abrirModalImprimir = function() {
    const anioActual = new Date().getFullYear();
    const selectAnoMes = document.getElementById('selectAnoMes');
    const selectAno = document.getElementById('selectAnoImprimir');
    selectAnoMes.innerHTML = '';
    selectAno.innerHTML = '';
    for (let a = anioActual; a >= anioActual - 5; a--) {
        selectAnoMes.innerHTML += `<option value="${a}">${a}</option>`;
        selectAno.innerHTML += `<option value="${a}">${a}</option>`;
    }
    const mesActual = new Date().getMonth() + 1;
    document.getElementById('selectMesImprimir').value = mesActual;

    document.querySelector('input[name="tipoPrint"][value="actual"]').checked = true;
    actualizarOpcionesPrint('actual');

    const modal = document.getElementById('modalImprimir');
    modal.style.display = 'flex';
};

window.actualizarOpcionesPrint = function(tipo) {
    document.getElementById('opcionesMes').style.display = (tipo === 'mes') ? 'flex' : 'none';
    document.getElementById('opcionesAno').style.display = (tipo === 'ano') ? 'block' : 'none';
};

window.ejecutarImpresion = async function() {
    const tipo = document.querySelector('input[name="tipoPrint"]:checked').value;
    let params = '';
    let tituloReporte = '';

    const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    if (tipo === 'actual') {
        params = `periodo=${periodoActual}`;
        const labels = { '1dia': 'Hoy', '1semana': 'Esta Semana', '1mes': 'Este Mes', '1ano': 'Este Año' };
        tituloReporte = labels[periodoActual] || periodoActual;
    } else if (tipo === 'mes') {
        const mes = document.getElementById('selectMesImprimir').value;
        const ano = document.getElementById('selectAnoMes').value;
        params = `periodo=mes_especifico&mes=${mes}&ano=${ano}`;
        tituloReporte = `${meses[mes]} ${ano}`;
    } else if (tipo === 'ano') {
        const ano = document.getElementById('selectAnoImprimir').value;
        params = `periodo=ano_especifico&ano=${ano}`;
        tituloReporte = `Año ${ano}`;
    }

    document.getElementById('modalImprimir').style.display = 'none';

    try {
        const res = await fetch(`../../../php/obtener_datos_panel.php?${params}`);
        const data = await res.json();
        imprimirReporte(data, tituloReporte);
    } catch (e) { alert('Error al cargar los datos para imprimir.'); }
};

function imprimirReporte(data, titulo) {
    const ventana = window.open('', '_blank', 'width=900,height=700');
    const metodos = (data.labelsMetodos || []).map((l, i) => {
        const nombreMetodo = l.replace(/\s*\(.*\)$/, ''); // Quita " ($50.00)" del label
        return `<tr><td>${nombreMetodo}</td><td style="text-align:right;"><strong>$ ${Number(data.valoresMetodos[i] || 0).toFixed(2)}</strong></td></tr>`;
    }).join('');
    const productos = (data.productosNombres || []).map((n, i) =>
        `<tr><td>${n}</td><td style="text-align:right;">${data.productosCantidades[i]} uds.</td></tr>`
    ).join('');

    ventana.document.write(`
        <!DOCTYPE html><html lang="es"><head>
        <meta charset="UTF-8"><title>Reporte: ${titulo}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 30px; color: #2c3e50; }
            h1 { text-align: center; color: #2980b9; border-bottom: 2px solid #2980b9; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 25px; font-size: 1rem; }
            .resumen { display: flex; gap: 20px; margin: 20px 0; }
            .tarjeta { flex:1; background: #f0f4f8; border-radius: 8px; padding: 15px; text-align: center; }
            .tarjeta .valor { font-size: 1.6rem; font-weight: bold; color: #27ae60; margin-top: 5px; }
            .tarjeta.rojo .valor { color: #e74c3c; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th { background: #2980b9; color: white; padding: 8px; text-align: left; }
            td { padding: 7px 8px; border-bottom: 1px solid #ecf0f1; }
            tr:nth-child(even) td { background: #f9f9f9; }
            .pie { text-align:center; margin-top:30px; font-size:0.8rem; color:#999; }
            @media print { body { margin: 10px; } }
        </style></head><body>
        <h1>📊 Reporte Gerencial: ${titulo}</h1>
        <p style="text-align:center; color:#7f8c8d;">Generado el ${new Date().toLocaleString('es-VE')}</p>

        <div class="resumen">
            <div class="tarjeta">
                <div>Ventas Cobradas</div>
                <div class="valor">$ ${data.totalVentas}</div>
            </div>
            <div class="tarjeta rojo">
                <div>Créditos del Período</div>
                <div class="valor">$ ${data.totalCreditoPeriodo}</div>
            </div>
            <div class="tarjeta rojo">
                <div>Deuda Total Global</div>
                <div class="valor">$ ${data.totalGlobalCredito}</div>
            </div>
            <div class="tarjeta" style="border-top: 3px solid #8e44ad;">
                <div>IGTF Recaudado</div>
                <div class="valor" style="color:#8e44ad;">$ ${data.totalIGTF ?? '0.00'}</div>
            </div>
        </div>

        <h2>Distribución de Ingresos por Método de Pago</h2>
        <table><thead><tr><th>Método</th><th style="text-align:right;">Monto</th></tr></thead>
        <tbody>${metodos || '<tr><td colspan="2">Sin datos</td></tr>'}</tbody></table>

        <h2>Top 5 Productos Más Vendidos</h2>
        <table><thead><tr><th>Producto</th><th style="text-align:right;">Cantidad</th></tr></thead>
        <tbody>${productos || '<tr><td colspan="2">Sin datos</td></tr>'}</tbody></table>

        <div class="pie">Optiget - Sistema de Gestión</div>
        <script>window.onload = () => { window.print(); }<\/script>
        </body></html>
    `);
    ventana.document.close();
}

async function cargarDatosPanel(periodo) {
    try {
        const response = await fetch(`../../../php/obtener_datos_panel.php?periodo=${periodo}`);
        const data = await response.json();

        document.getElementById('totalVentas').innerText = `$ ${data.totalVentas}`;
        document.getElementById('totalCredito').innerText = `$ ${data.totalCreditoPeriodo}`;
        document.getElementById('creditosActivos').innerText = `$ ${data.totalGlobalCredito}`;
        document.getElementById('totalIGTF').innerText = `$ ${data.totalIGTF ?? '0.00'}`;

        actualizarGraficas(data);
    } catch (e) { console.error("Error en dashboard", e); }
}

function actualizarGraficas(data) {
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
        if (dist < inner || dist > outer) {
            tooltipEl.style.display = 'none';
            redrawDoughnutHighlight(canvas, -1);
            return;
        }
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
    canvas.onmouseleave = function() {
        tooltipEl.style.display = 'none';
        redrawDoughnutHighlight(canvas, -1);
    };
}

function attachTooltipBar(canvas, labels, values, tooltipEl) {
    if (!canvas || !tooltipEl) return;
    const rect = () => canvas.getBoundingClientRect();
    canvas.onmousemove = function(e) {
        const r = rect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const bars = canvas._bars || [];
        if (!bars.length) {
            tooltipEl.style.display = 'none';
            redrawBarHighlight(canvas, -1);
            return;
        }
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
    canvas.onmouseleave = function() {
        tooltipEl.style.display = 'none';
        redrawBarHighlight(canvas, -1);
    };
}

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

function drawDoughnut(ctx, values, labels) {
    const canvas = ctx.canvas;
    const DPR = window.devicePixelRatio || 1;
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
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartH);
    ctx.lineTo(padding + chartW, padding + chartH);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
    const colors = ['#28a745', '#007bff', '#ffc107', '#17a2b8', '#6610f2', '#c54b00', '#6f42c1'];
    canvas._bars = [];
    for (let i = 0; i < labels.length; i++) {
        const val = Number(values[i]) || 0;
        const h = (val / maxVal) * (chartH - 10);
        const x = padding + i * (barW + gap);
        const y = padding + chartH - h;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, barW, h);
        canvas._bars.push({ x, y, w: barW, h, label: labels[i], value: val, color: colors[i % colors.length] });
    }
}