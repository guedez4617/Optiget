const form = document.getElementById('formRegistro');
const inputPrecio = document.getElementById('precio');
const checkIva = document.getElementById('iva');

let precioOriginal = 0;

// Cargar datos si es edición
const datosEdicion = JSON.parse(localStorage.getItem("productoAEditar"));

window.onload = () => {
    if (datosEdicion) {
        document.getElementById('tituloPagina').innerText = "Editar Producto";
        const p = datosEdicion;
        document.getElementById('codigo_barra').value = p.codigo;
        document.getElementById('codigo_barra').readOnly = true;
        document.getElementById('categoria').value = p.categoria || "";
        document.getElementById('marca').value = p.marca || "";
        document.getElementById('nombre').value = p.nombre;
        document.getElementById('cantidad').value = p.cantidad;
        document.getElementById('precio').value = p.precio;
        document.getElementById('iva').checked = p.conIva;

        precioOriginal = parseFloat(p.precio) || 0;
    }
};

// Lógica de cálculo del 16% IVA al presionar el checkbox
checkIva.addEventListener('change', () => {
    let valorActual = parseFloat(inputPrecio.value) || 0;
    if (checkIva.checked) {
        precioOriginal = valorActual;
        inputPrecio.value = (precioOriginal * 1.16).toFixed(2);
    } else {
        inputPrecio.value = precioOriginal.toFixed(2);
    }
});

// Guardar en Base de Datos
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const productoData = {
        codigo: document.getElementById('codigo_barra').value,
        categoria: document.getElementById('categoria').value,
        marca: document.getElementById('marca').value,
        nombre: document.getElementById('nombre').value,
        cantidad: parseInt(document.getElementById('cantidad').value),
        precio: parseFloat(document.getElementById('precio').value), // IMPORTANTE: parseFloat para decimales
        conIva: document.getElementById('iva').checked ? 1 : 0
    };

    try {
        const response = await fetch('../../../php/guardar_producto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoData)
        });

        const resultado = await response.json();
        if (resultado.status === "success") {
            alert(resultado.message);
            localStorage.removeItem("productoAEditar");
            window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) {
        alert("Error de conexión con el servidor");
    }
});