document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const userIn = document.getElementById('usuario').value.trim();
    const passIn = document.getElementById('password').value;

    try {
        // Enviamos los datos al servidor
        const response = await fetch('php/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario: userIn,
                password: passIn
            })
        });

        const resultado = await response.json();

        if (resultado.status === "success") {
            // Guardamos los datos del usuario (Nombre, Rol, CI) para usarlos en el Inicio
            localStorage.setItem('usuarioActivo', JSON.stringify(resultado.usuario));

            // Redirigir según el ROL si lo deseas, o al inicio general
            alert("¡Bienvenido " + resultado.usuario.NOMBRE + "!");
            window.location.href = "pantallas/inicio/inicio.html";

        } else {
            // Si el PHP dice que los datos son incorrectos
            alert(resultado.message);
        }

    } catch (error) {
        console.error("Error en el login:", error);
        alert("No se pudo conectar con el servidor de autenticación.");
    }
});