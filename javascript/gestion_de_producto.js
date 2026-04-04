// Variable global para guardar los datos originales de la base de datos
let listaProductosGlobal = [];
let mostrandoInactivos = false; // Controla qué vista estamos viendo

/**
 * 1. CARGA INICIAL: Trae los productos de MySQL
 */
async function cargarProductos() {
    const tbody = document.getElementById("cuerpoTabla");
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Cargando inventario...</td></tr>';

    try {
        // Añadimos el parámetro inactivos según el estado de la variable global
        const url = `../../../php/obtener_productos.php?inactivos=${mostrandoInactivos}`;
        const response = await fetch(url);
        const productos = await response.json();

        if (productos.error) throw new Error(productos.error);

        listaProductosGlobal = productos;
        renderizarTabla(listaProductosGlobal);

    } catch (error) {
        console.error("Error al cargar:", error);
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:red;">Error de conexión.</td></tr>';
    }
}

/**
 * 2. RENDERIZAR TABLA
 */
function renderizarTabla(datos) {
    const tbody = document.getElementById("cuerpoTabla");
    tbody.innerHTML = "";

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:20px; color:gray;">
            ${mostrandoInactivos ? 'No hay productos inactivos.' : 'No se encontraron productos activos.'}
        </td></tr>`;
        return;
    }

    datos.forEach((p) => {
        const fila = document.createElement("tr");

        const esIva = parseInt(p.tieneIva) === 1;
        const precioBase = parseFloat(p.precio) || 0;
        const precioFinal = esIva ? (precioBase * 1.16) : precioBase;

        const unidades = parseInt(p.unidades) || 0;
        const stockClase = unidades > 5 ? "in-stock" : "low-stock";
        const stockTexto = unidades > 5 ? "Bastante" : "Poco";

        // --- LÓGICA DE BOTÓN DINÁMICO ---
        // Si estamos viendo inactivos, mostramos botón de reactivar. Si no, el de eliminar.
        const botonAccion = mostrandoInactivos ?
            `<span class="icono-reactivar" title="Reactivar" onclick="reactivarProducto('${p.codigo}')" style="cursor:pointer; font-size:1.2rem;">🔄</span>` :
            `<span class="icono-eliminar" title="Eliminar" onclick="eliminarProducto('${p.codigo}')">🗑️</span>`;

        fila.innerHTML = `
            <td>${p.codigo}</td>
            <td>${p.categoria || '-'}</td>
            <td>${p.marca || '-'}</td>
            <td>${p.nombre}</td>
            <td>${unidades}</td>
            <td><strong>$${precioFinal.toFixed(2)}</strong></td>
            <td style="color: ${esIva ? '#27ae60' : '#888'}; font-weight: bold;">
                ${esIva ? 'Sí (16%)' : 'No'}
            </td>
            <td><span class="tamaño ${stockClase}">${stockTexto}</span></td>
            <td><span class="icono-editar" onclick='editarProducto(${JSON.stringify(p)})'>✎</span></td>
            <td>${botonAccion}</td>
        `;
        tbody.appendChild(fila);
    });
}

/**
 * NUEVA FUNCIÓN: Alternar entre ver Activos e Inactivos
 * Debes llamar a esta función desde un botón en tu HTML
 */
function alternarVistaInactivos() {
    mostrandoInactivos = !mostrandoInactivos;

    // Opcional: Cambiar texto de un botón en el HTML si existe
    const btnText = document.getElementById("btnFiltroInactivos");
    if (btnText) {
        btnText.textContent = mostrandoInactivos ? "Ver Activos" : "Ver Inactivos";
    }

    cargarProductos();
}

/**
 * NUEVA FUNCIÓN: Reactivar Producto
 */
function reactivarProducto(codigo) {
    if (!confirm("¿Deseas volver a activar este producto en el inventario?")) return;

    fetch('../../../php/activar_producto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo: codigo })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "ok") {
                alert(data.mensaje);
                cargarProductos(); // Refresca la lista
            } else {
                alert("Error: " + data.mensaje);
            }
        })
        .catch(err => console.error("Error al reactivar:", err));
}

/**
 * 3. BUSCADOR POR NOMBRE
 */
document.getElementById("buscarInput").addEventListener("input", (e) => {
    const valorBusqueda = e.target.value.toLowerCase().trim();
    const resultadosFiltrados = listaProductosGlobal.filter(p =>
        (p.nombre || "").toLowerCase().includes(valorBusqueda)
    );
    renderizarTabla(resultadosFiltrados);
});

/**
 * 4. FUNCIONES DE APOYO
 */
function nuevoProducto() {
    localStorage.removeItem("productoAEditar");
    window.location.href = "../registro_de_producto/registro_de_producto.html";
}

function editarProducto(p) {
    localStorage.setItem("productoAEditar", JSON.stringify({
        codigo: p.codigo,
        categoria: p.categoria,
        marca: p.marca,
        nombre: p.nombre,
        cantidad: p.unidades,
        precio: p.precio,
        conIva: parseInt(p.tieneIva) === 1
    }));
    window.location.href = "../registro_de_producto/registro_de_producto.html";
}

/**
 * 5. ELIMINAR PRODUCTO (BORRADO LÓGICO)
 */
function eliminarProducto(codigo) {
    if (!confirm("¿Estás seguro de que deseas retirar este producto?")) return;

    fetch('../../../php/eliminar_producto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo: codigo })
        })
        .then(async res => {
            if (!res.ok) throw new Error("Error en el servidor");
            return res.json();
        })
        .then(data => {
            if (data.status === "ok") {
                alert(data.mensaje);
                cargarProductos();
            } else {
                alert("Error: " + data.mensaje);
            }
        })
        .catch(err => {
            alert("No se pudo conectar con el servidor.");
        });
}

window.onload = cargarProductos;