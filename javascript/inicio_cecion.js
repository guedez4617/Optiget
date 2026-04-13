document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById('loginForm');

    if (formLogin) {
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 1. Captura de credenciales
            const usuarioInput = document.getElementById('usuario');
            const passwordInput = document.getElementById('password');

            const usuario = usuarioInput.value.trim();
            const password = passwordInput.value;

            if (!usuario || !password) {
                return alert("⚠️ Por favor, ingrese su usuario y contraseña.");
            }

            try {
                // 2. Petición al servidor
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

                    // --- PROCESAMIENTO DE DATOS (Basado en tu tabla de DB) ---

                    // Aseguramos que NOMBRE y APELLIDO existan para evitar el 'undefined'
                    const nombre = datosUser.NOMBRE || "";
                    const apellido = datosUser.APELLIDO || "";
                    const nombreCompleto = `${nombre} ${apellido}`.trim();

                    // Manejo especial para la columna 'C.I' (con punto)
                    const cedula = datosUser['C.I'] || datosUser.CI || "0";

                    // Captura del ROL (usamos el mismo nombre que en la tabla)
                    const rolAsignado = datosUser.ROL || "";

                    // 3. GUARDADO EN LOCALSTORAGE (Llaves estandarizadas)
                    localStorage.setItem("nombreUsuarioLogueado", nombreCompleto);
                    localStorage.setItem("ciUsuarioLogueado", cedula);
                    localStorage.setItem("rol", rolAsignado);

                    // Guardamos los permisos como una lista (si no vienen, array vacío)
                    localStorage.setItem("permisos", JSON.stringify(datosUser.permisos || []));

                    // 4. REDIRECCIÓN
                    window.location.href = "pantallas/inicio/inicio.html";

                } else {
                    // Error de credenciales
                    alert("❌ " + resultado.message);
                    passwordInput.value = "";
                    passwordInput.focus();
                }

            } catch (error) {
                console.error("Error crítico en el login:", error);
                alert("🚫 Error de conexión: No se pudo contactar con el servidor.");
            }
        });
    } else {
        console.error("No se encontró el formulario con ID 'loginForm'");
    }
});