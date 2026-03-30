document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página se recargue

    const userIn = document.getElementById('usuario').value.trim();
    const passIn = document.getElementById('password').value;

    //  Obtener la lista de usuarios del LocalStorage
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuariosSistema')) || [];

    //  Buscar si existe un usuario que coincida con nombre y clave
    const usuarioValido = usuariosGuardados.find(u => u.usuario === userIn && u.clave === passIn);

    if (usuarioValido) {
        // Guardar en sesión quién entró (para usar su nombre en el Inicio)
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioValido));

        alert("¡Bienvenido, " + usuarioValido.usuario + " (" + usuarioValido.rango + ")!");

        // Redirigir al inicio
        window.location.href = "pantallas/inicio/inicio.html";
    } else {
        // Si los datos son incorrectos
        alert("Usuario o contraseña incorrectos. Por favor, intente de nuevo");
    }
});