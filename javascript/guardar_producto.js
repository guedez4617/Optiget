const form = document.getElementById('formRegistro');
const inputPrecio = document.getElementById('precio');
const checkIva = document.getElementById('iva');

// Recuperar información de edición si existe
const datosEdicion = JSON.parse(localStorage.getItem("productoAEditar"));

window.onload = () => {
    if (datosEdicion) {
        document.getElementById('tituloPagina').innerText = "Editar Producto";

        const p = datosEdicion;
        // Rellenar campos con los datos existentes
        document.getElementById('codigo_barra').value = p.codigo;
        document.getElementById('codigo_barra').readOnly = true; // El código no se edita por integridad
        document.getElementById('categoria').value = p.categoria || "";
        document.getElementById('marca').value = p.marca || "";
        document.getElementById('nombre').value = p.nombre;
        document.getElementById('Precentacion').value = p.presentacion || "";
        document.getElementById('cantidad').value = p.cantidad;
        document.getElementById('precio').value = p.precio;
        document.getElementById('iva').checked = (p.conIva == 1 || p.conIva === true);

    } else {
        form.reset();
        document.getElementById('codigo_barra').readOnly = false;
        document.getElementById('tituloPagina').innerText = "Registrar Nuevo Producto";
    }
};

// Evento principal para guardar o actualizar
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // --- CAPTURA DE VALORES ---
    const codigo = document.getElementById('codigo_barra').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const presentacion = document.getElementById('Precentacion').value.trim();
    const categoria = document.getElementById('categoria').value;
    const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
    const precio = parseFloat(document.getElementById('precio').value) || 0;
    const conIva = document.getElementById('iva').checked ? 1 : 0;

    // --- VALIDACIONES ---
    const soloNumeros = /^[0-9]+$/;
    if (codigo.length < 7 || /^0+$/.test(codigo) || !soloNumeros.test(codigo)) {
        return alert("⚠️ El código debe ser numérico, tener al menos 7 caracteres y no ser solo ceros.");
    }

    const soloLetrasEspacios = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!soloLetrasEspacios.test(marca) || !soloLetrasEspacios.test(nombre)) {
        return alert("⚠️ 'Marca' y 'Nombre' solo permiten letras y espacios.");
    }

    // --- VERIFICACIÓN DE CÓDIGO (Solo si es nuevo) ---
    if (!datosEdicion) {
        try {
            const checkRes = await fetch(`../../../php/verificar_codigo_producto.php?codigo=${codigo}`);
            const checkData = await checkRes.json();
            if (checkData.existe) {
                return alert(`⚠️ El código ${codigo} ya está registrado con el producto: ${checkData.nombre}`);
            }
        } catch (error) {
            console.error("Error al verificar código:", error);
        }
    }

    // --- PREPARACIÓN DEL OBJETO PARA EL PHP ---
    const productoData = {
        codigo,
        categoria,
        marca,
        nombre,
        presentacion,
        cantidad,
        precio,
        conIva,
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
            alert(resultado.message);
            localStorage.removeItem("productoAEditar");
            window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
        } else {
            alert("Atención: " + (resultado.message || resultado.mensaje));
        }

    } catch (error) {
        console.error("Error de conexión:", error);
        alert("🚫 Error de conexión con el servidor.");
    }
});

// Función para el botón cancelar
function cancelar() {
    localStorage.removeItem("productoAEditar");
    window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
}