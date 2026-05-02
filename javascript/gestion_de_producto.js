let listaProductosGlobal = [];
let mostrandoInactivos = false;

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
    cargarProductos(); // Recargar para actualizar stock general si hubo cambios
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
            data.lotes.forEach(lote => {
                tbody.innerHTML += `
                    <tr>
                        <td>${lote.numero_lote}</td>
                        <td>${lote.fecha_caducidad}</td>
                        <td>${lote.cantidad}</td>
                        <td><button onclick="eliminarLote(${lote.id_lote}, '${codigo}')" style="background:#e74c3c; color:white; border:none; padding:2px 5px; cursor:pointer; border-radius:3px;">Eliminar</button></td>
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
        const res = await fetch('../../../php/agregar_lote.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, fecha_caducidad, cantidad })
        });
        const data = await res.json();
        if (data.status === 'success') {
            document.getElementById('formAgregarLote').reset();
            document.getElementById('lote_codigo_producto').value = codigo; // restaurar el hidden input
            cargarLotes(codigo);
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error al agregar el lote.');
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