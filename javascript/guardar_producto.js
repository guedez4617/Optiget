    const form = document.getElementById('formRegistro');
    // Intentamos obtener el índice del producto a editar
    const indiceEditar = localStorage.getItem("indiceEditar");

    // --- AL CARGAR LA PÁGINA ---
    window.onload = () => {
        if (indiceEditar !== null) {
            // Si hay un índice, cambiamos el título y el botón
            document.getElementById('tituloPagina').innerText = "Editar Producto Seleccionado";
            document.getElementById('btnAccion').innerText = "Actualizar Información";

            // Buscamos los datos en el LocalStorage
            const productos = JSON.parse(localStorage.getItem("productosVenta")) || [];
            const p = productos[indiceEditar];

            if (p) {
                // RELLENAMOS LOS CAMPOS AUTOMÁTICAMENTE
                document.getElementById('codigo_barra').value = p.codigo;
                document.getElementById('categoria').value = p.categoria || "";
                document.getElementById('marca').value = p.marca || "";
                document.getElementById('nombre').value = p.nombre;
                document.getElementById('cantidad').value = p.cantidad;
                document.getElementById('precio').value = p.precio;
                document.getElementById('iva').checked = p.conIva;
            }
        }
    };

    // --- AL GUARDAR O ACTUALIZAR ---
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const productoActualizado = {
            codigo: document.getElementById('codigo_barra').value,
            categoria: document.getElementById('categoria').value,
            marca: document.getElementById('marca').value,
            nombre: document.getElementById('nombre').value,
            cantidad: parseInt(document.getElementById('cantidad').value),
            precio: parseFloat(document.getElementById('precio').value),
            conIva: document.getElementById('iva').checked
        };

        let productos = JSON.parse(localStorage.getItem("productosVenta")) || [];

        if (indiceEditar !== null) {
            // Estamos editando: Reemplazamos en la posición guardada
            productos[indiceEditar] = productoActualizado;
            localStorage.removeItem("indiceEditar"); // Limpiamos la memoria de edición
        } else {
            // Estamos creando uno nuevo: Lo agregamos al final
            productos.push(productoActualizado);
        }

        // Guardamos la lista actualizada
        localStorage.setItem("productosVenta", JSON.stringify(productos));

        alert("¡Datos procesados correctamente!");
        // Volvemos a la tabla automáticamente
        window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
    });

    function cancelar() {
        localStorage.removeItem("indiceEditar"); // Limpiar por si acaso
        window.location.href = "../Gestión de Productos/gestion_de_produtos.html";
    }