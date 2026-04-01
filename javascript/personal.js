let listaUsuariosGlobal = [];

// 1. Cargar datos (Solo ocurre al abrir la página o eliminar)
async function cargarUsuarios() {
    const tablaBody = document.getElementById('tablaUsuariosBody');
    tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando usuarios...</td></tr>';

    try {
        const response = await fetch('../../../php/obtener_usuarios.php');
        const usuarios = await response.json();

        if (usuarios.error) throw new Error(usuarios.error);

        listaUsuariosGlobal = usuarios;
        renderizarTabla(listaUsuariosGlobal);

    } catch (error) {
        console.error("Error:", error);
        tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error de conexión.</td></tr>';
    }
}

// 2. Función de dibujo (Dibuja lo que haya en el array que reciba)
function renderizarTabla(datos) {
    const tablaBody = document.getElementById('tablaUsuariosBody');
    tablaBody.innerHTML = "";

    if (datos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No se encontraron resultados.</td></tr>';
        return;
    }

    datos.forEach((u) => {
        tablaBody.innerHTML += `
            <tr>
                <td><strong>${u['C.I']}</strong></td>
                <td>${u.NOMBRE}</td>
                <td>${u.APELLIDO}</td>
                <td>${u.telefono}</td>
                <td><span class="rango-badge">${u.ROL}</span></td>
                <td style="text-align: center;">
                    <button onclick='prepararEdicion(${JSON.stringify(u)})' class="icono-editar">✎</button>
                    <button onclick="eliminarUsuario('${u['C.I']}')" class="icono-eliminar">🗑️</button>
                </td>
            </tr>`;
    });
}

// 3. Inicialización y Eventos
document.addEventListener('DOMContentLoaded', () => {
    // Cargamos los datos de la DB al iniciar
    cargarUsuarios();

    const inputBusqueda = document.getElementById('inputBusqueda');

    // Escuchamos el evento 'input' (se dispara cada vez que escribes una letra)
    inputBusqueda.addEventListener('input', (e) => {
        const texto = e.target.value.toLowerCase().trim();

        // Si no hay texto, mostramos todo
        if (texto === "") {
            renderizarTabla(listaUsuariosGlobal);
            return;
        }

        // Filtramos la lista global
        const filtrados = listaUsuariosGlobal.filter(u => {
            // Aseguramos que los campos existan antes de comparar para evitar errores
            const nombre = u.NOMBRE ? u.NOMBRE.toLowerCase() : "";
            const apellido = u.APELLIDO ? u.APELLIDO.toLowerCase() : "";
            const cedula = u['C.I'] ? u['C.I'].toString() : "";

            return nombre.includes(texto) ||
                apellido.includes(texto) ||
                cedula.includes(texto);
        });

        // Mostramos solo los filtrados
        renderizarTabla(filtrados);
    });
});

// 4. Preparar Edición
function prepararEdicion(u) {
    localStorage.setItem('usuarioAEditar', JSON.stringify({
        datos: {
            cedula: u['C.I'],
            nombre: u.NOMBRE,
            apellido: u.APELLIDO,
            usuario: u.N_USUARIO,
            clave: u.CONTRASEÑA,
            rango: u.ROL,
            telefono: u.telefono
        }
    }));
    window.location.href = "../registro_de_usuario/re.html";
}

// 5. Eliminar Usuario
async function eliminarUsuario(cedula) {
    if (confirm(`¿Eliminar usuario con C.I: ${cedula}?`)) {
        try {
            const response = await fetch('../../../php/eliminar_usuario.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cedula: cedula })
            });
            const res = await response.json();
            if (res.status === "success") {
                alert("Eliminado");
                cargarUsuarios();
            }
        } catch (e) { alert("Error al eliminar"); }
    }
}