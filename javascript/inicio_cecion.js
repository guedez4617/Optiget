document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById('loginForm');

    if (formLogin) {
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 1. Captura de elementos e inputs
            const usuarioInput = document.getElementById('usuario');
            const passwordInput = document.getElementById('password');
            const btnLogin = e.target.querySelector('button[type="submit"]');

            const usuario = usuarioInput.value.trim();
            const password = passwordInput.value;

            // 2. Validación básica
            if (!usuario || !password) {
                return alert("⚠️ Por favor, ingrese su usuario y contraseña.");
            }

            // Deshabilitar botón para evitar múltiples clics
            if (btnLogin) btnLogin.disabled = true;

            try {
                // 3. Petición al servidor
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

                // 4. Procesamiento de la respuesta
                if (resultado.status === "success") {
                    const datosUser = resultado.usuario;

                    // A. Preparación de datos para LocalStorage
                    const nombre = datosUser.NOMBRE || "";
                    const apellido = datosUser.APELLIDO || "";
                    const nombreCompleto = `${nombre} ${apellido}`.trim();
                    const cedula = datosUser.CI || datosUser['C.I'] || "0";
                    const rolNombre = datosUser.nombre_rol || "";

                    // B. GUARDADO EN LOCALSTORAGE (Estructura robusta)

                    // Guardamos el objeto completo (CRUCIAL para la interfaz de Ajustes)
                    localStorage.setItem("usuario", JSON.stringify(datosUser));

                    // Guardamos datos individuales (Para compatibilidad con otras pantallas)
                    localStorage.setItem("nombreUsuarioLogueado", nombreCompleto);
                    localStorage.setItem("ciUsuarioLogueado", cedula);
                    localStorage.setItem("rol", rolNombre);

                    // Guardamos la lista de permisos (Para permisos.js)
                    localStorage.setItem("permisos", JSON.stringify(resultado.permisos || []));

                    // 5. Redirección exitosa
                    window.location.href = "pantallas/inicio/inicio.html";

                } else {
                    // Manejo de error de credenciales
                    alert("❌ " + (resultado.message || "Credenciales incorrectas"));
                    passwordInput.value = "";
                    passwordInput.focus();
                }

            } catch (error) {
                console.error("Error crítico en el login:", error);
                alert("🚫 Error de conexión: No se pudo contactar con el servidor.");
            } finally {
                // Rehabilitar botón si hubo error
                if (btnLogin) btnLogin.disabled = false;
            }
        });
    }
});