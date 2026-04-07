const form = document.getElementById('formRegistro');
const inputPrecio = document.getElementById('precio');
const checkIva = document.getElementById('iva');

// 1. CARGA INICIAL
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
        // Mantenemos el ID Precentacion como lo tienes en el HTML
        document.getElementById('Precentacion').value = p.presentacion || "";
        document.getElementById('cantidad').value = p.cantidad;
        document.getElementById('precio').value = p.precio;
        document.getElementById('iva').checked = p.conIva;

    } else {
        form.reset();
        document.getElementById('codigo_barra').readOnly = false;
        document.getElementById('tituloPagina').innerText = "Registrar Nuevo Producto";
    }
};

/**
 * 2. LÓGICA DE IVA (SIMPLIFICADA)
 * Se eliminó el cálculo del 1.16. El checkbox ahora solo sirve como etiqueta.
 */
checkIva.addEventListener('change', () => {
    console.log("Estado del IVA:", checkIva.checked ? "Activado" : "Desactivado");
});

// 3. GUARDAR / ACTUALIZAR
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const productoData = {
        codigo: document.getElementById('codigo_barra').value.trim(),
        categoria: document.getElementById('categoria').value,
        marca: document.getElementById('marca').value,
        nombre: document.getElementById('nombre').value,
        presentacion: document.getElementById('Precentacion').value,
        cantidad: parseInt(document.getElementById('cantidad').value) || 0,
        // Se guarda el precio exactamente como se escribió en el input
        precio: parseFloat(document.getElementById('precio').value) || 0,
        // Solo enviamos 1 o 0 para indicar si el precio ya incluye IVA o debe marcarse con IVA
        conIva: document.getElementById('iva').checked ? 1 : 0,
        esEdicion: datosEdicion ? true : false
    };

    try {
        const response = await fetch('../../../php/guardar_producto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoData)
        });

        if (!response.ok) throw new Error("Error " + response.status);

        const resultado = await response.json();

        if (resultado.status === "success") {
            alert(resultado.message);
            localStorage.removeItem("productoAEditar");
            window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
        } else {
            alert("Atención: " + resultado.message);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión con el servidor.");
    }
});

function cancelar() {
    localStorage.removeItem("productoAEditar");
    window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
}