// Carga los usuarios desde localStorage y los dibuja en la tabla
function cargarUsuarios() {
    const tablaBody = document.getElementById('tablaUsuariosBody');
    const filtro = document.getElementById('inputBusqueda').value.toLowerCase();
    const usuarios = JSON.parse(localStorage.getItem('usuariosSistema')) || [];

    tablaBody.innerHTML = "";

    usuarios.forEach((u, index) => {
        // Filtro de búsqueda
        if (u.usuario.toLowerCase().includes(filtro) || u.cedula.includes(filtro)) {
            tablaBody.innerHTML += `
                        <tr>
                            <td><strong>${u.cedula}</strong></td>
                            <td>${u.usuario}</td>
                            <td>${u.telefono}</td>
                            <td><span class="rango-badge">${u.rango}</span></td>
                            <td style="text-align: center;">
                                <button onclick="prepararEdicion(${index})" class="icono-editar" title="Editar">✎</button>
                                <button onclick="eliminarUsuario(${index})" class="icono-eliminar" title="Eliminar">🗑️</button>
                            </td>
                        </tr>`;
        }
    });

    if (usuarios.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#999;">No hay usuarios registrados en el sistema.</td></tr>';
    }
}

// Guarda el usuario en un temporal y manda a re.html para editarlo
function prepararEdicion(index) {
    const usuarios = JSON.parse(localStorage.getItem('usuariosSistema'));
    localStorage.setItem('usuarioAEditar', JSON.stringify({
        index: index,
        datos: usuarios[index]
    }));
    window.location.href = "/pantallas/Gerente/registro_de_usuario/re.html";
}

// Elimina el usuario del array y actualiza localStorage
function eliminarUsuario(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        let usuarios = JSON.parse(localStorage.getItem('usuariosSistema'));
        usuarios.splice(index, 1);
        localStorage.setItem('usuariosSistema', JSON.stringify(usuarios));
        cargarUsuarios();
    }
}

// Iniciar carga al entrar
window.onload = cargarUsuarios;