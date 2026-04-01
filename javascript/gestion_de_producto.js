// Variable global para guardar los datos originales de la base de datos
let listaProductosGlobal = [];

/**
 * 1. CARGA INICIAL: Trae los productos de MySQL
 */
async function cargarProductos() {
    const tbody = document.getElementById("cuerpoTabla");
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Cargando inventario...</td></tr>';

    try {
        const response = await fetch('../../../php/obtener_productos.php');
        const productos = await response.json();

        if (productos.error) throw new Error(productos.error);

        // Guardamos los datos en la variable global
        listaProductosGlobal = productos;

        // Mostramos la tabla completa al cargar
        renderizarTabla(listaProductosGlobal);

    } catch (error) {
        console.error("Error al cargar:", error);
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:red;">Error de conexión.</td></tr>';
    }
}

/**
 * 2. RENDERIZAR TABLA: Dibuja las filas según los datos que reciba
 */
function renderizarTabla(datos) {
    const tbody = document.getElementById("cuerpoTabla");
    tbody.innerHTML = "";

    if (datos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px; color:gray;">No se encontraron productos.</td></tr>';
        return;
    }

    datos.forEach((p) => {
        const fila = document.createElement("tr");

        // Cálculo de IVA (16%) y Precio Final
        const esIva = parseInt(p.tieneIva) === 1;
        const precioBase = parseFloat(p.precio) || 0;
        const precioFinal = esIva ? (precioBase * 1.16) : precioBase;

        // Lógica de Stock (unidades)
        const unidades = parseInt(p.unidades) || 0;
        const stockClase = unidades > 5 ? "in-stock" : "low-stock";
        const stockTexto = unidades > 5 ? "Bastante" : "Poco";

        // MODIFICACIÓN: Pasamos p.codigo y p.nombre (escapado) a eliminarProducto
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
            <td><span class="icono-eliminar" onclick="eliminarProducto('${p.codigo}', '${p.nombre.replace(/'/g, "\\'")}')">🗑️</span></td>
        `;
        tbody.appendChild(fila);
    });
}

/**
 * 3. BUSCADOR POR NOMBRE (TIEMPO REAL)
 */
document.getElementById("buscarInput").addEventListener("input", (e) => {
    const valorBusqueda = e.target.value.toLowerCase().trim();

    const resultadosFiltrados = listaProductosGlobal.filter(p => {
        const nombreProducto = (p.nombre || "").toLowerCase();
        return nombreProducto.includes(valorBusqueda);
    });

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
 * 5. ELIMINAR PRODUCTO (ACTUALIZADO)
 * Ahora recibe el nombre para mostrarlo en la alerta de confirmación
 */
async function eliminarProducto(codigo, nombre) {
    // La alerta ahora muestra el nombre del producto
    if (confirm(`¿Estás seguro de que deseas eliminar el producto: "${nombre}"?`)) {
        try {
            const response = await fetch('../../../php/eliminar_producto.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo: codigo })
            });
            const res = await response.json();

            if (res.status === "success") {
                alert(`El producto "${nombre}" ha sido eliminado correctamente.`);
                cargarProductos(); // Recarga la tabla desde la DB
            } else {
                alert("Error al eliminar: " + res.message);
            }
        } catch (e) {
            alert("Error de conexión con el servidor.");
        }
    }
}

// Iniciar carga al abrir la página
window.onload = cargarProductos;