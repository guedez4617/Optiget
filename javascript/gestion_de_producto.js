// --- CARGAR PRODUCTOS AL INICIAR ---
function cargarProductos() {
    const productos = JSON.parse(localStorage.getItem("productosVenta")) || [];
    const tbody = document.getElementById("cuerpoTabla");
    tbody.innerHTML = "";

    productos.forEach((p, index) => {
        const fila = document.createElement("tr");

        const stockClase = p.cantidad > 5 ? "in-stock" : "low-stock";
        const stockTexto = p.cantidad > 5 ? "Bastante" : "Poco";

        fila.innerHTML = `
                    <td>${p.codigo}</td>
                    <td>${p.categoria || '-'}</td>
                    <td>${p.marca || '-'}</td>
                    <td>${p.nombre}</td>
                    <td>${p.cantidad}</td>
                    <td>$${parseFloat(p.precio).toFixed(2)}</td>
                    <td>${p.conIva ? 'Sí' : 'No'}</td>
                    <td><span class="tamaño ${stockClase}">${stockTexto}</span></td>
                    <td><span class="icono-editar" onclick="editarProducto(${index})">✎</span></td>
                    <td><span class="icono-eliminar" onclick="eliminarProducto(${index})">🗑️</span></td>
                `;
        tbody.appendChild(fila);
    });
}

// --- FUNCIÓN EDITAR (ACTUALIZADA) ---
function editarProducto(index) {
    // Guardamos el índice para que la pantalla de registro sepa qué producto cargar
    localStorage.setItem("indiceEditar", index);
    // Redirigimos a la pantalla de registro
    window.location.href = "../pantallas/Almacen/Gestión de Productos/registro_de_productos.html";
}

// --- FUNCIÓN NUEVO PRODUCTO ---
function nuevoProducto() {
    // Limpiamos el índice de edición por si acaso
    localStorage.removeItem("indiceEditar");
    window.location.href = "../pantallas/Almacen/Gestión de Productos/registro_de_productos.html";
}

// --- BUSCADOR ---
document.getElementById("btnBuscar").addEventListener("click", () => {
    const input = document.getElementById("buscarInput").value.toLowerCase();
    const filas = document.querySelectorAll(".producto-tabla tbody tr");

    filas.forEach(fila => {
        const textoFila = fila.innerText.toLowerCase();
        fila.style.display = textoFila.includes(input) ? "" : "none";
    });
});

// --- ELIMINAR PRODUCTO ---
function eliminarProducto(index) {
    if (confirm("¿Seguro que quieres eliminar este producto del almacén?")) {
        let productos = JSON.parse(localStorage.getItem("productosVenta")) || [];
        productos.splice(index, 1);
        localStorage.setItem("productosVenta", JSON.stringify(productos));
        cargarProductos();
    }
}

window.onload = cargarProductos;