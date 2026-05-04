let listaProductosGlobal = [];
let mostrandoInactivos = false;
let loteIdAEditar = null; // Para rastrear si estamos editando un lote

async function cargarProductos() {
    const tbody = document.getElementById("cuerpoTabla");
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;">Cargando inventario...</td></tr>';

    try {
        const url = `../../../php/obtener_productos.php?inactivos=${mostrandoInactivos}`;
        const response = await fetch(url);
        const productos = await response.json();

        if (productos.error) throw new Error(productos.error);

        listaProductosGlobal = productos;
        renderizarTabla(listaProductosGlobal);

    } catch (error) {
        console.error("Error al cargar:", error);
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center; color:red;">Error de conexión.</td></tr>';
    }
}

function renderizarTabla(datos) {
    const tbody = document.getElementById("cuerpoTabla");
    tbody.innerHTML = "";

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:20px; color:gray;">
            ${mostrandoInactivos ? 'No hay productos inactivos.' : 'No se encontraron productos activos.'}
        </td></tr>`;
        return;
    }

    datos.forEach((p) => {
        const fila = document.createElement("tr");

        const esIva = parseInt(p.tieneIva) === 1;
        const precioBase = parseFloat(p.precio) || 0;
        const montoIva = esIva ? (precioBase * 0.16) : 0;
        const precioTotal = precioBase + montoIva;
        const unidades = parseInt(p.unidades) || 0;
        const stockClase = unidades > 5 ? "in-stock" : "low-stock";
        const stockTexto = unidades > 5 ? "Bastante" : "Poco";
        const botonAccion = mostrandoInactivos ?
            `<span class="icono-reactivar" title="Reactivar" onclick="reactivarProducto('${p.Codigo}')" style="cursor:pointer; font-size:1.2rem;">🔄</span>` :
            `<span class="icono-eliminar" title="Eliminar" onclick="eliminarProducto('${p.Codigo}')" style="cursor:pointer;">🗑️</span>`;
        const botonLotes = `<button onclick="abrirModalLotes('${p.Codigo}', '${p.nombre.replace(/'/g, "\\'")}')" title="Ver Lotes" class="icono-auditoria">⌕</button>`;

        fila.innerHTML = `
            <td>${p.Codigo}</td>
            <td>${p.categoria || '-'}</td>
            <td>${p.marca || '-'}</td>
            <td>${p.nombre}</td>
            <td>${p.Presentacion || '-'}</td>
            <td>${unidades}</td>
            
            <td>$${precioBase.toFixed(2)}</td>
            
            <td style="color: ${esIva ? '#27ae60' : '#888'};">P
                <div>${esIva ? '16%' : '0%'}</div>
                <div style="font-size: 0.8rem; font-style: italic;">($${montoIva.toFixed(2)})</div>
            </td>

            <td><strong>$${precioTotal.toFixed(2)}</strong></td>

            <td><span class="tamaño ${stockClase}">${stockTexto}</span></td>
            <td><span class="icono-editar" style="cursor:pointer;" onclick='editarProducto(${JSON.stringify(p)})'>✎</span></td>
            <td>${botonLotes}</td>
            <td>${botonAccion}</td>
        `;
        tbody.appendChild(fila);
    });
}

document.getElementById("buscarInput").addEventListener("input", (e) => {
    const valorBusqueda = e.target.value.toLowerCase().trim();
    const columnaSeleccionada = document.getElementById("filtroColumna").value;

    const resultadosFiltrados = listaProductosGlobal.filter(p => {
        let valorCelda = "";

        if (columnaSeleccionada === "tieneIva") {
            valorCelda = parseInt(p.tieneIva) === 1 ? "si sí" : "no";
        } else if (columnaSeleccionada === "codigo") {
            valorCelda = (p.Codigo || "").toString().toLowerCase();
        } else if (columnaSeleccionada === "presentacion") {
            valorCelda = (p.Presentacion || "").toString().toLowerCase();
        } else {
            valorCelda = (p[columnaSeleccionada] || "").toString().toLowerCase();
        }

        return valorCelda.includes(valorBusqueda);
    });

    renderizarTabla(resultadosFiltrados);
});

function alternarVistaInactivos() {
    mostrandoInactivos = !mostrandoInactivos;
    const btnText = document.getElementById("btnFiltroInactivos");
    if (btnText) {
        btnText.textContent = mostrandoInactivos ? "Ver Activos" : "Ver Inactivos";
    }
    cargarProductos();
}

function reactivarProducto(codigo) {
    if (!confirm("¿Deseas volver a activar este producto?")) return;
    fetch('../../../php/activar_producto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo: codigo })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "ok") { cargarProductos(); } else { alert(data.mensaje); }
        });
}

function eliminarProducto(codigo) {
    if (!confirm("¿Retirar este producto del inventario activo?")) return;
    fetch('../../../php/eliminar_producto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo: codigo })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "ok") { cargarProductos(); } else { alert(data.mensaje); }
        });
}

function editarProducto(p) {
    localStorage.setItem("productoAEditar", JSON.stringify({
        codigo: p.Codigo,
        categoria: p.categoria,
        marca: p.marca,
        nombre: p.nombre,
        presentacion: p.Presentacion,
        cantidad: p.unidades,
        precio: p.precio,
        conIva: parseInt(p.tieneIva) === 1
    }));
    window.location.href = "../registro_de_producto/registro_de_producto.html";
}

function nuevoProducto() {
    localStorage.removeItem("productoAEditar");
    window.location.href = "../registro_de_producto/registro_de_producto.html";
}

// === GESTION DE LOTES ===
function abrirModalLotes(codigo, nombre) {
    document.getElementById('modalLotes').style.display = 'block';
    document.getElementById('tituloModalLotes').innerText = `Lotes: ${nombre}`;
    document.getElementById('lote_codigo_producto').value = codigo;
    cargarLotes(codigo);
}

function cerrarModalLotes() {
    document.getElementById('modalLotes').style.display = 'none';
    loteIdAEditar = null; // Resetear modo edición
    resetearFormularioLote();
    cargarProductos(); // Recargar para actualizar stock general si hubo cambios
}

function resetearFormularioLote() {
    loteIdAEditar = null;
    const form = document.getElementById('formAgregarLote');
    if (form) form.reset();

    document.getElementById('nueva_fecha_caducidad').disabled = false;
    document.getElementById('lote_no_vence').disabled = false;
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.innerText = "Guardar Lote";

    // Quitar resaltado de edición si existe
    const filas = document.querySelectorAll('#cuerpoTablaLotes tr');
    filas.forEach(f => f.style.background = "");
}

async function cargarLotes(codigo) {
    const tbody = document.getElementById('cuerpoTablaLotes');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    try {
        const res = await fetch(`../../../php/obtener_lotes.php?codigo=${codigo}`);
        const data = await res.json();

        if (data.status === 'success') {
            tbody.innerHTML = '';
            if (data.lotes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">No hay lotes activos.</td></tr>';
                return;
            }
            data.lotes.forEach((lote, index) => {
                // El primer lote (index 0) es siempre el actual (ya sea por FEFO o por en_uso = 1)
                const esLoteActual = (index === 0);
                const badgeActual = esLoteActual ? '<span style="background:var(--color-tema, #3498db); color:white; font-size:0.7rem; padding:2px 5px; border-radius:3px; margin-left:5px;" title="Lote actual que se está descontando en ventas">Activo</span>' : '';
                const estiloFila = esLoteActual ? 'background-color: rgba(52, 152, 219, 0.05);' : '';

                tbody.innerHTML += `
                    <tr style="${estiloFila}">
                        <td style="${esLoteActual ? 'font-weight:bold;' : ''}">${lote.numero_lote} ${badgeActual}</td>
                        <td>${lote.fecha_caducidad}</td>
                        <td>${lote.cantidad}</td>
                        <td style="display:flex; gap:5px;">
                            <button onclick="editarCantidadLote(${lote.id_lote}, ${lote.cantidad}, '${lote.fecha_caducidad}', '${codigo}')" style="background:#3498db; color:white; border:none; padding:4px 8px; cursor:pointer; border-radius:3px; font-size:10px;">Editar</button>
                            <button onclick="eliminarLote(${lote.id_lote}, '${codigo}')" style="background:#e74c3c; color:white; border:none; padding:4px 8px; cursor:pointer; border-radius:3px; font-size:10px;">Eliminar</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4">${data.message}</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4">Error de conexión</td></tr>';
    }
}

async function eliminarLote(id_lote, codigo) {
    if (!confirm('¿Seguro que deseas eliminar este lote? Esto restará el stock.')) return;
    try {
        const res = await fetch('../../../php/eliminar_lote.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_lote })
        });
        const data = await res.json();
        if (data.status === 'success') {
            cargarLotes(codigo);
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error al eliminar el lote.');
    }
}

async function editarCantidadLote(id_lote, cantidadActual, fechaCaducidad, codigoProducto) {
    loteIdAEditar = id_lote;

    // Cargar datos en el formulario
    document.getElementById('nueva_cantidad_lote').value = cantidadActual;

    const inputFecha = document.getElementById('nueva_fecha_caducidad');
    const chkNoVence = document.getElementById('lote_no_vence');

    if (fechaCaducidad === '9999-12-31') {
        chkNoVence.checked = true;
        inputFecha.value = "";
    } else {
        chkNoVence.checked = false;
        inputFecha.value = fechaCaducidad;
    }

    // Bloquear campos de fecha
    inputFecha.disabled = true;
    chkNoVence.disabled = true;

    // Cambiar texto del botón
    const btn = document.getElementById('formAgregarLote').querySelector('button[type="submit"]');
    btn.innerText = "Actualizar Cantidad";

    // Resaltar la fila que se está editando
    const filas = document.querySelectorAll('#cuerpoTablaLotes tr');
    filas.forEach(f => {
        f.style.background = "";
        if (f.innerHTML.includes(`editarCantidadLote(${id_lote}`)) {
            f.style.background = "rgba(52, 152, 219, 0.2)";
        }
    });

    document.getElementById('nueva_cantidad_lote').focus();
}

document.getElementById('formAgregarLote').addEventListener('submit', async(e) => {
    e.preventDefault();
    const codigo = document.getElementById('lote_codigo_producto').value;
    const chkNoVence = document.getElementById('lote_no_vence');
    const noVence = chkNoVence && chkNoVence.checked;
    let fecha_caducidad = document.getElementById('nueva_fecha_caducidad').value;

    if (noVence) {
        fecha_caducidad = "9999-12-31";
    }

    const cantidad = document.getElementById('nueva_cantidad_lote').value;

    try {
        if (!loteIdAEditar) {
            // Obtenemos los lotes actuales para ver si hay uno en curso y comparar fecha
            const lotesRes = await fetch(`../../../php/obtener_lotes.php?codigo=${codigo}`);
            const dataLotes = await lotesRes.json();
            if (dataLotes.status === 'success' && dataLotes.lotes.length > 0) {
                const loteActivo = dataLotes.lotes[0]; // El primero por FEFO o el que está en uso
                if (fecha_caducidad < loteActivo.fecha_caducidad) {
                    const confirmar = confirm(`El nuevo lote vence el ${fecha_caducidad}, antes que el lote activo (${loteActivo.fecha_caducidad}).\n\n¿Deseas terminar primero las ${loteActivo.cantidad} unidades del lote activo?\n\n- [Aceptar]: Terminar lote actual primero.\n- [Cancelar]: Usar el nuevo lote de inmediato.`);
                    if (confirmar) {
                        await fetch('../../../php/marcar_lote_en_uso.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_lote: loteActivo.id_lote, codigo_producto: codigo })
                        });
                    }
                }
            }
        }

        let endpoint = '../../../php/agregar_lote.php';
        let body = { codigo, fecha_caducidad, cantidad };

        if (loteIdAEditar) {
            endpoint = '../../../php/editar_cantidad_lote.php';
            body = { id_lote: loteIdAEditar, nueva_cantidad: cantidad };
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.status === 'success') {
            resetearFormularioLote();
            document.getElementById('lote_codigo_producto').value = codigo; // restaurar el hidden input
            cargarLotes(codigo);
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error al procesar el lote.');
    }
});

window.onload = () => {
    cargarProductos();

    const chkNoVence = document.getElementById('lote_no_vence');
    if (chkNoVence) {
        chkNoVence.addEventListener('change', function() {
            const inputFecha = document.getElementById('nueva_fecha_caducidad');
            if (this.checked) {
                inputFecha.disabled = true;
                inputFecha.required = false;
                inputFecha.value = "";
                inputFecha.style.opacity = "0.5";
            } else {
                inputFecha.disabled = false;
                inputFecha.required = true;
                inputFecha.style.opacity = "1";
            }
        });
    }
};