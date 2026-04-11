const form = document.getElementById('formRegistro');
const inputPrecio = document.getElementById('precio');
const checkIva = document.getElementById('iva');

// cargar para editar
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

// guarda o actualiza 
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // --- CAPTURA DE VALORES ---
    const codigo = document.getElementById('codigo_barra').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const presentacion = document.getElementById('Precentacion').value.trim();

    // --- VALIDACIONES DE REGLAS ---

    // 1. Validación de Código: Min 7 caracteres, no puede ser 0000000, solo números
    const soloNumeros = /^[0-9]+$/;
    if (codigo.length < 7) {
        alert("⚠️ El código debe tener al menos 7 caracteres.");
        return;
    }
    if (/^0+$/.test(codigo)) {
        alert("⚠️ El código no puede ser solo ceros.");
        return;
    }
    if (!soloNumeros.test(codigo)) {
        alert("⚠️ El código solo debe contener números.");
        return;
    }

    // 2. Validación de Marca y Nombre: Solo letras y espacios
    const soloLetrasEspacios = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!soloLetrasEspacios.test(marca)) {
        alert("⚠️ En 'Marca' solo se permiten letras y espacios.");
        return;
    }
    if (!soloLetrasEspacios.test(nombre)) {
        alert("⚠️ En 'Nombre' solo se permiten letras y espacios.");
        return;
    }

    // 3. Validación de Presentación: Solo letras y números
    const letrasYNumeros = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!letrasYNumeros.test(presentacion)) {
        alert("⚠️ En 'Presentación' solo se permiten letras y números.");
        return;
    }

    // --- NUEVA VALIDACIÓN: VERIFICAR SI EL CÓDIGO YA EXISTE (Solo si es nuevo) ---
    if (!datosEdicion) {
        try {
            const checkRes = await fetch(`../../../php/verificar_codigo_producto.php?codigo=${codigo}`);
            const checkData = await checkRes.json();

            if (checkData.existe) {
                alert(`⚠️ El código ${codigo} ya está registrado con el producto: ${checkData.nombre}`);
                return;
            }
        } catch (error) {
            console.error("Error verificando código:", error);
        }
    }

    // --- PREPARACIÓN DE DATOS ---
    const productoData = {
        codigo: codigo,
        categoria: document.getElementById('categoria').value,
        marca: marca,
        nombre: nombre,
        presentacion: presentacion,
        cantidad: parseInt(document.getElementById('cantidad').value) || 0,
        precio: parseFloat(document.getElementById('precio').value) || 0,
        conIva: document.getElementById('iva').checked ? 1 : 0,
        esEdicion: datosEdicion ? true : false
    };

    try {
        const response = await fetch('../../../php/guardar_producto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoData)
        });

        const resultado = await response.json();

        if (resultado.status === "success") {
            localStorage.removeItem("productoAEditar");
            window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
        } else {
            alert("Atención: " + resultado.message);
        }

    } catch (error) {
        alert("Error de conexión con el servidor.");
    }
});

function cancelar() {
    localStorage.removeItem("productoAEditar");
    window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
}