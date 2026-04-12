document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById('loginForm');

    if (formLogin) {
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();

            const usuarioInput = document.getElementById('usuario');
            const passwordInput = document.getElementById('password');

            const usuario = usuarioInput.value.trim();
            const password = passwordInput.value;

            if (!usuario || !password) {
                return alert("⚠️ Por favor, ingrese su usuario y contraseña.");
            }

            try {
                const response = await fetch('php/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario: usuario,
                        password: password
                    })
                });

                if (!response.ok) {
                    throw new Error("Error en la respuesta del servidor");
                }

                const resultado = await response.json();

                if (resultado.status === "success") {
                    const datosUser = resultado.usuario;

                    // 1. Guardamos la información básica
                    localStorage.setItem("nombreUsuarioLogueado", `${datosUser.NOMBRE} ${datosUser.APELLIDO}`);
                    localStorage.setItem("ciUsuarioLogueado", datosUser['C.I']);

                    // 2. Guardamos el ROL y los PERMISOS (Vital para el menú)
                    localStorage.setItem("rol", datosUser.ROL);
                    localStorage.setItem("permisos", JSON.stringify(datosUser.permisos || []));

                    // 3. Redirección
                    window.location.href = "pantallas/inicio/inicio.html";
                } else {
                    alert("❌ " + resultado.message);
                    passwordInput.value = "";
                    passwordInput.focus();
                }

            } catch (error) {
                console.error("Error crítico en el login:", error);
                alert("🚫 Error de conexión con el servidor.");
            }
        });
    }
});