document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById('loginForm');

    if (formLogin) {
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();

            const usuarioInput = document.getElementById('usuario');
            const passwordInput = document.getElementById('password');
            const btnLogin = e.target.querySelector('button[type="submit"]');
            const usuario = usuarioInput.value.trim();
            const password = passwordInput.value;
            if (!usuario || !password) {
                return alert("⚠️ Por favor, ingrese su usuario y contraseña.");
            }
            if (btnLogin) btnLogin.disabled = true;
            try {
                const response = await fetch('php/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario: usuario,
                        password: password
                    })
                });

                if (!response.ok) throw new Error("Error en la respuesta del servidor");

                const resultado = await response.json();
                if (resultado.status === "success") {
                    const datosUser = resultado.usuario;
                    const nombre = datosUser.NOMBRE || "";
                    const apellido = datosUser.APELLIDO || "";
                    const nombreCompleto = `${nombre} ${apellido}`.trim();
                    const cedula = datosUser.CI || datosUser['C.I'] || "0";
                    const rolNombre = datosUser.nombre_rol || "";
                    localStorage.setItem("usuario", JSON.stringify(datosUser));
                    localStorage.setItem("nombreUsuarioLogueado", nombreCompleto);
                    localStorage.setItem("ciUsuarioLogueado", cedula);
                    localStorage.setItem("rol", rolNombre);
                    localStorage.setItem("permisos", JSON.stringify(resultado.permisos || []));
                    window.location.href = "pantallas/inicio/inicio.html";

                } else {
                    alert("❌ " + (resultado.message || "Credenciales incorrectas"));
                    passwordInput.value = "";
                    passwordInput.focus();
                }

            } catch (error) {
                console.error("Error crítico en el login:", error);
                alert("🚫 Error de conexión: No se pudo contactar con el servidor.");
            } finally {
                if (btnLogin) btnLogin.disabled = false;
            }
        });
    }
});