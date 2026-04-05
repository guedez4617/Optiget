// almacen_registro.js

const form = document.getElementById('formRegistro');
const inputPrecio = document.getElementById('precio');
const checkIva = document.getElementById('iva');

let precioOriginal = 0;

/**
 * 1. CARGA INICIAL: Si venimos de la tabla con "Editar", llenamos los campos
 */
const datosEdicion = JSON.parse(localStorage.getItem("productoAEditar"));

window.onload = () => {
    if (datosEdicion) {
        document.getElementById('tituloPagina').innerText = "Editar Producto";

        const p = datosEdicion;
        // Llenado de campos
        document.getElementById('codigo_barra').value = p.codigo;
        document.getElementById('codigo_barra').readOnly = true; // El código no se debe cambiar
        document.getElementById('categoria').value = p.categoria || "";
        document.getElementById('marca').value = p.marca || "";
        document.getElementById('nombre').value = p.nombre;
        document.getElementById('cantidad').value = p.cantidad;
        document.getElementById('precio').value = p.precio;
        document.getElementById('iva').checked = p.conIva;

        precioOriginal = parseFloat(p.precio) || 0;
    }
};

/**
 * 2. LÓGICA DE IVA (16%): Cálculo visual en el formulario
 */
checkIva.addEventListener('change', () => {
    let valorActual = parseFloat(inputPrecio.value) || 0;
    if (checkIva.checked) {
        precioOriginal = valorActual;
        inputPrecio.value = (precioOriginal * 1.16).toFixed(2);
    } else {
        // Al quitar el IVA, intentamos volver al precio base
        // Si el precio fue modificado manualmente, el cálculo base cambia
        inputPrecio.value = precioOriginal.toFixed(2);
    }
});

/**
 * 3. GUARDAR / ACTUALIZAR EN BASE DE DATOS
 */
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Estructura de datos exacta para el PHP
    const productoData = {
        codigo: document.getElementById('codigo_barra').value,
        categoria: document.getElementById('categoria').value,
        marca: document.getElementById('marca').value,
        nombre: document.getElementById('nombre').value,
        cantidad: parseInt(document.getElementById('cantidad').value) || 0,
        precio: parseFloat(document.getElementById('precio').value) || 0,
        conIva: document.getElementById('iva').checked ? 1 : 0
    };

    try {
        // Enviamos a guardar_producto.php (que maneja Insert y Update)
        const response = await fetch('../../../php/guardar_producto.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoData)
        });

        // Verificamos si la respuesta es válida antes de convertir a JSON
        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor (Status: " + response.status + ")");
        }

        const resultado = await response.json();

        if (resultado.status === "success") {
            // Limpiamos el modo edición
            localStorage.removeItem("productoAEditar");

            // Redirección a la tabla de gestión
            window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
        } else {
            // Si el PHP envió un error controlado (ej: error de SQL)
            alert("Error: " + (resultado.message || "No se pudo guardar el producto"));
        }

    } catch (error) {
        console.error("Error detallado:", error);
        alert("No se pudo conectar con el servidor o la respuesta no es válida.");
    }
});

/**
 * 4. BOTÓN CANCELAR (Opcional)
 */
function cancelar() {
    localStorage.removeItem("productoAEditar");
    window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
}