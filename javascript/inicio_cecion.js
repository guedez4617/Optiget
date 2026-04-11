document.addEventListener("DOMContentLoaded", () => {

    // Vinculamos el formulario usando el ID exacto de tu HTML: 'loginForm'
    const formLogin = document.getElementById('loginForm');

    if (formLogin) {
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 1. Captura de credenciales desde los inputs
            const usuarioInput = document.getElementById('usuario');
            const passwordInput = document.getElementById('password');

            const usuario = usuarioInput.value.trim();
            const password = passwordInput.value;

            // 2. Validación simple antes de enviar al servidor
            if (!usuario || !password) {
                return alert("⚠️ Por favor, ingrese su usuario y contraseña.");
            }

            try {
                // 3. Petición al servidor (PHP)
                // Asegúrate de que la carpeta 'php' esté en la misma raíz que tu index.html
                const response = await fetch('php/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario: usuario,
                        password: password
                    })
                });

                // Verificamos si la respuesta del servidor es válida
                if (!response.ok) {
                    throw new Error("Error en la respuesta del servidor");
                }

                const resultado = await response.json();

                if (resultado.status === "success") {
                    // 4. MANEJO DE DATOS DEL USUARIO
                    // Extraemos los datos que vienen del SELECT en el PHP
                    const datosUser = resultado.usuario;

                    // Concatenamos NOMBRE y APELLIDO reales para el saludo
                    const nombreReal = `${datosUser.NOMBRE} ${datosUser.APELLIDO}`;

                    // Guardamos en localStorage para persistencia entre páginas
                    localStorage.setItem("nombreUsuarioLogueado", nombreReal);
                    localStorage.setItem("rolUsuarioLogueado", datosUser.ROL);
                    localStorage.setItem("ciUsuarioLogueado", datosUser['C.I']);

                    // 5. REDIRECCIÓN
                    // Te envía a la carpeta de bienvenida que definiste
                    window.location.href = "pantallas/inicio/inicio.html";
                } else {
                    // Error de credenciales (Usuario o clave mal escritos)
                    alert("❌ " + resultado.message);
                    passwordInput.value = ""; // Limpiamos solo la clave por seguridad
                    passwordInput.focus();
                }

            } catch (error) {
                console.error("Error crítico en el login:", error);
                alert("🚫 Error de conexión: No se pudo contactar con el servidor. Verifica que Apache esté encendido.");
            }
        });
    } else {
        // Este error aparecerá en consola si el ID 'loginForm' no existe en el HTML cargado
        console.error("CRÍTICO: No se encontró el formulario 'loginForm'. Revisa los IDs de tu HTML.");
    }
});