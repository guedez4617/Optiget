let listaUsuariosGlobal = [];

// 1. Cargar todos los datos del personal
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
        tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error al cargar datos.</td></tr>';
    }
}

// 2. Dibuja la tabla
function renderizarTabla(datos) {
    const tablaBody = document.getElementById('tablaUsuariosBody');
    tablaBody.innerHTML = "";

    if (datos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No se encontraron usuarios activos.</td></tr>';
        return;
    }

    datos.forEach((u) => {
        // Manejo de la cédula por si tiene puntos o no en la BD
        const cedula = u.CI || u['C.I'];

        tablaBody.innerHTML += `
            <tr>
                <td><strong>${cedula}</strong></td>
                <td>${u.NOMBRE}</td>
                <td>${u.APELLIDO}</td>
                <td>${u.telefono}</td>
                <td><span class="rango-badge">${u.nombre_rol}</span></td>
                <td style="text-align: center;">
                    <button onclick='prepararEdicion(${JSON.stringify(u)})' class="icono-editar" title="Editar">✎</button>
                    <button onclick="eliminarUsuario('${cedula}')" class="icono-eliminar" title="Inhabilitar">🗑️</button>
                </td>
            </tr>`;
    });
}

// 3. Buscador en tiempo real
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();

    const inputBusqueda = document.getElementById('inputBusqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase().trim();

            const filtrados = listaUsuariosGlobal.filter(u => {
                const nombre = (u.NOMBRE || "").toLowerCase();
                const apellido = (u.APELLIDO || "").toLowerCase();
                const cedula = (u.CI || u['C.I'] || "").toString();

                return nombre.includes(texto) || apellido.includes(texto) || cedula.includes(texto);
            });

            renderizarTabla(filtrados);
        });
    }
});

// 4. Preparar Edición (Guarda en LocalStorage y redirige)
function prepararEdicion(u) {
    localStorage.setItem('usuarioAEditar', JSON.stringify({
        datos: {
            cedula: u.CI || u['C.I'],
            nombre: u.NOMBRE,
            apellido: u.APELLIDO,
            usuario: u.N_USUARIO,
            clave: u.CONTRASEÑA,
            rango: u.rol,
            telefono: u.telefono
        }
    }));
    window.location.href = "../registro_de_usuario/re.html";
}

// 5. Inhabilitar Usuario (Borrado lógico)
async function eliminarUsuario(cedula) {
    if (confirm(`¿Está seguro de inhabilitar al usuario con C.I: ${cedula}?`)) {
        try {
            const response = await fetch('../../../php/eliminar_usuario.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cedula: cedula })
            });

            const res = await response.json();

            if (res.status === "success") {
                alert("Usuario inhabilitado con éxito.");
                cargarUsuarios(); // Recargar la tabla
            } else {
                alert("Error: " + res.message);
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión al inhabilitar.");
        }
    }
}