// Variable global para guardar los datos originales de la base de datos
let listaProductosGlobal = [];
let mostrandoInactivos = false;

/**
 * 1. CARGA INICIAL: Obtiene productos desde el servidor
 */
async function cargarProductos() {
    const tbody = document.getElementById("cuerpoTabla");
    // Usamos colspan 11 porque agregamos la columna Presentación
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

/**
 * 2. RENDERIZAR TABLA: Dibuja las filas basándose en el array recibido
 */
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

        // --- LÓGICA DE CÁLCULOS ---
        const esIva = parseInt(p.tieneIva) === 1;
        const precioBase = parseFloat(p.precio) || 0;

        // 1. Calculamos cuánto es el 16% (Monto del impuesto)
        const montoIva = esIva ? (precioBase * 0.16) : 0;

        // 2. Calculamos el Total (Precio Base + Impuesto)
        const precioTotal = precioBase + montoIva;

        // Lógica de Stock (Poco / Bastante)
        const unidades = parseInt(p.unidades) || 0;
        const stockClase = unidades > 5 ? "in-stock" : "low-stock";
        const stockTexto = unidades > 5 ? "Bastante" : "Poco";

        // Botón de acción según la vista (Eliminar o Reactivar)
        const botonAccion = mostrandoInactivos ?
            `<span class="icono-reactivar" title="Reactivar" onclick="reactivarProducto('${p.Codigo}')" style="cursor:pointer; font-size:1.2rem;">🔄</span>` :
            `<span class="icono-eliminar" title="Eliminar" onclick="eliminarProducto('${p.Codigo}')" style="cursor:pointer;">🗑️</span>`;

        // Construcción de la fila con las 12 columnas correspondientes
        fila.innerHTML = `
            <td>${p.Codigo}</td>
            <td>${p.categoria || '-'}</td>
            <td>${p.marca || '-'}</td>
            <td>${p.nombre}</td>
            <td>${p.Presentacion || '-'}</td>
            <td>${unidades}</td>
            
            <td>$${precioBase.toFixed(2)}</td>
            
            <td style="color: ${esIva ? '#27ae60' : '#888'};">
                <div>${esIva ? '16%' : '0%'}</div>
                <div style="font-size: 0.8rem; font-style: italic;">($${montoIva.toFixed(2)})</div>
            </td>

            <td><strong>$${precioTotal.toFixed(2)}</strong></td>

            <td><span class="tamaño ${stockClase}">${stockTexto}</span></td>
            <td><span class="icono-editar" style="cursor:pointer;" onclick='editarProducto(${JSON.stringify(p)})'>✎</span></td>
            <td>${botonAccion}</td>
        `;
        tbody.appendChild(fila);
    });
}

/**
 * 3. BUSCADOR DINÁMICO (Multi-Filtro)
 */
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

/**
 * 4. FUNCIONES DE ACCIÓN Y ESTADO
 */
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

window.onload = cargarProductos;