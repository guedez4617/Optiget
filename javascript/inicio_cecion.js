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

                const resultado = await response.json();

                if (resultado.status === "success") {
                    const datosUser = resultado.usuario;

                    // 1. Procesamiento de Nombres
                    const nombre = datosUser.NOMBRE || "";
                    const apellido = datosUser.APELLIDO || "";
                    const nombreCompleto = `${nombre} ${apellido}`.trim();

                    // 2. Manejo de Cédula (CI según tu última captura)
                    const cedula = datosUser.CI || datosUser['C.I'] || "0";

                    // 3. Captura del ROL (Nombre del rol: Gerente, Cajero, etc.)
                    const rolNombre = datosUser.nombre_rol || "";

                    // 4. GUARDADO EN LOCALSTORAGE
                    localStorage.setItem("nombreUsuarioLogueado", nombreCompleto);
                    localStorage.setItem("ciUsuarioLogueado", cedula);
                    localStorage.setItem("rol", rolNombre);

                    // IMPORTANTE: Guardamos la lista de permisos que el PHP debe enviar
                    // Esto es lo que lee tu permisos.js
                    localStorage.setItem("permisos", JSON.stringify(resultado.permisos || []));

                    // Redirección
                    window.location.href = "pantallas/inicio/inicio.html";

                } else {
                    alert("❌ " + resultado.message);
                    passwordInput.value = "";
                    passwordInput.focus();
                }

            } catch (error) {
                console.error("Error crítico en el login:", error);
                alert("🚫 Error de conexión: No se pudo contactar con el servidor.");
            }
        });
    }
});