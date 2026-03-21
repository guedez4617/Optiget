        // --- FUNCIÓN PARA BUSCAR CLIENTE ---
        document.getElementById('btnBuscar').addEventListener('click', () => {
            const cedula = document.getElementById('cedula').value.trim();
            const clientes = JSON.parse(localStorage.getItem("clientesRegistrados")) || [];

            const encontrado = clientes.find(c => c.cedula === cedula);

            if (encontrado) {
                document.getElementById('nombre').value = encontrado.nombre;
                document.getElementById('telefono').value = encontrado.telefono;
                document.getElementById('correo').value = encontrado.correo;
                document.getElementById('direccion').value = encontrado.direccion;
                alert("Cliente cargado.");
            } else {
                alert("Cliente no encontrado. Complete los datos para registrarlo.");
            }
        });

        // --- FUNCIÓN PARA GUARDAR Y SEGUIR ---
        document.getElementById('formCliente').addEventListener('submit', (e) => {
            e.preventDefault();

            const nuevoCliente = {
                cedula: document.getElementById('cedula').value.trim(),
                nombre: document.getElementById('nombre').value,
                telefono: document.getElementById('telefono').value,
                correo: document.getElementById('correo').value,
                direccion: document.getElementById('direccion').value
            };

            let clientes = JSON.parse(localStorage.getItem("clientesRegistrados")) || [];

            // Si ya existe por cédula, lo actualizamos; si no, lo añadimos
            const index = clientes.findIndex(c => c.cedula === nuevoCliente.cedula);
            if (index !== -1) {
                clientes[index] = nuevoCliente;
            } else {
                clientes.push(nuevoCliente);
            }

            // Guardamos en la base de datos (LocalStorage)
            localStorage.setItem("clientesRegistrados", JSON.stringify(clientes));

            // Guardamos quién es el cliente de la venta actual
            localStorage.setItem("clienteActual", JSON.stringify(nuevoCliente));

            window.location.href = "/pantallas/Cajera/caja/principal.html";
        });