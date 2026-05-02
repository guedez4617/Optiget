let listaUsuariosGlobal = [];
async function cargarUsuarios() {
    const tablaBody = document.getElementById('tablaUsuariosBody');
    tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando usuarios...</td></tr>';

    try {
        const response = await fetch('../../../php/obtener_usuarios.php');
        const usuarios = await response.json();

        if (usuarios.error) throw new Error(usuarios.error);

        listaUsuariosGlobal = usuarios;
        renderizarTabla(listaUsuariosGlobal);

    } catch (error) {
        console.error("Error:", error);
        tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error al cargar datos.</td></tr>';
    }
}

function renderizarTabla(datos) {
    const tablaBody = document.getElementById('tablaUsuariosBody');
    tablaBody.innerHTML = "";

    if (datos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No se encontraron usuarios activos.</td></tr>';
        return;
    }

    datos.forEach((u) => {
        const cedula = u.CI || u['C.I'];

        tablaBody.innerHTML += `
            <tr>
                <td><strong>${cedula}</strong></td>
                <td>${u.NOMBRE}</td>
                <td>${u.APELLIDO}</td>
                <td>${u.telefono}</td>
                <td><span class="rango-badge">${u.nombre_rol}</span></td>
                <td style="text-align: center;">
                    <button onclick='prepararEdicion(${JSON.stringify(u)})' class="icono-editar" title="Editar">✎</button>
                    <button onclick="eliminarUsuario('${cedula}')" class="icono-eliminar" title="Inhabilitar">🗑️</button>
                    <button onclick="abrirAuditoria('${cedula}')" title="Auditoria" class="icono-auditoria">⌕</button>
                </td>
            </tr>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();

    const inputBusqueda = document.getElementById('inputBusqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase().trim();

            const filtrados = listaUsuariosGlobal.filter(u => {
                const nombre = (u.NOMBRE || "").toLowerCase();
                const apellido = (u.APELLIDO || "").toLowerCase();
                const cedula = (u.CI || u['C.I'] || "").toString();

                return nombre.includes(texto) || apellido.includes(texto) || cedula.includes(texto);
            });

            renderizarTabla(filtrados);
        });
    }
});

function prepararEdicion(u) {
    localStorage.setItem('usuarioAEditar', JSON.stringify({
        datos: {
            cedula: u.CI || u['C.I'],
            nombre: u.NOMBRE,
            apellido: u.APELLIDO,
            usuario: u.N_USUARIO,
            clave: u.CONTRASEÑA,
            rango: u.rol,
            telefono: u.telefono
        }
    }));
    window.location.href = "../registro_de_usuario/re.html";
}

async function eliminarUsuario(cedula) {
    if (confirm(`¿Está seguro de inhabilitar al usuario con C.I: ${cedula}?`)) {
        try {
            const response = await fetch('../../../php/eliminar_usuario.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cedula: cedula })
            });

            const res = await response.json();

            if (res.status === "success") {
                alert("Usuario inhabilitado con éxito.");
                cargarUsuarios();
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión al inhabilitar.");
        }
    }
}

let currentAuditoriaCI = '';

function abrirAuditoria(ci) {
    currentAuditoriaCI = ci;
    const modal = document.getElementById('modalAuditoria');
    if (modal) modal.style.display = 'flex';
    const titulo = document.getElementById('tituloAuditoria');
    if (titulo) titulo.innerText = `Seguimiento de Actividad - C.I: ${ci}`;
    ejecutarAuditoriaDetallada(ci);
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalAuditoria');
    const btnCerrar = document.getElementById('cerrarAuditoria');
    if (btnCerrar) {
        btnCerrar.onclick = () => {
            if (modal) modal.style.display = 'none';
        };
    }
});

async function ejecutarAuditoriaDetallada(ci) {
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
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:#f0f7ff; padding:10px; border-radius:8px; color:#333;">
                <span style="font-weight:bold; color:#0056b3;">Resultado para C.I: ${ci}</span>
                <button onclick="imprimirSeccion('all')" class="btn-auditoria" style="background:#28a745; font-size:12px; padding: 5px 10px; border: none; color: white; border-radius: 4px; cursor: pointer;">Imprimir Todo el Historial</button>
            </div>
        `;

        let htmlContenido = sesiones.map((sesion, index) => {
            let movimientosHtml = sesion.movimientos.map(m => {
                let claseColor = (m.accion === 'VENTA') ? 'tag-venta' :
                    (m.accion === 'ABONO') ? 'tag-abono' :
                    (m.accion === 'NEGOCIO') ? 'tag-negocio' : 'tag-historial';

                if (m.accion.includes('HABILITAR') || m.accion.includes('ACTIVAR')) claseColor = 'tag-venta';

                return `
                    <div style="padding:8px; border-bottom:1px solid #eee; font-size:13px; color:#333;">
                        <span class="accion-tag ${claseColor}" style="padding: 3px 7px; border-radius: 4px; color: white; font-size: 11px; font-weight: bold; margin-right: 8px; display: inline-block; min-width: 65px; text-align: center;">${m.accion}</span>
                        <b>[${new Date(m.fecha_completa).toLocaleTimeString('es-VE', { hour12: true })}]</b> ${m.detalles}
                    </div>`;
            }).join('');

            const idSesion = `sesion_print_${index}`;

            return `
                <div id="${idSesion}" class="card-sesion-print" style="border:1px solid #ccc; margin-bottom:20px; border-radius:8px; background:white; overflow:hidden;">
                    <div style="background:#343a40; color:white; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:13px;">Inicio: ${new Date(sesion.inicio).toLocaleString('es-VE', { hour12: true })} | Fin: ${sesion.fin}</span>
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
    const ci = currentAuditoriaCI;

    if (id === 'all') {
        const tempDiv = document.getElementById('contenedorResultadosAuditoria').cloneNode(true);
        tempDiv.querySelectorAll('button').forEach(b => b.remove());
        contenidoParaImprimir = tempDiv.innerHTML;
    } else {
        const sesionDiv = document.getElementById(id).cloneNode(true);
        sesionDiv.querySelectorAll('button').forEach(b => b.remove());
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