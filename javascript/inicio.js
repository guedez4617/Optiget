document.addEventListener("DOMContentLoaded", () => {
    // 1. Extraer los datos guardados durante el Login
    const nombreReal = localStorage.getItem("nombreUsuarioLogueado");
    const rol = localStorage.getItem("rolUsuarioLogueado");

    // 2. Referencias a los elementos del HTML
    const etiquetaNombre = document.getElementById('nombreUsuario');
    const etiquetaRol = document.getElementById('rolUsuario');

    // 3. Insertar los datos si existen
    if (nombreReal) {
        etiquetaNombre.innerText = nombreReal;
    } else {
        // Si alguien intenta entrar sin loguearse, lo mandamos al login
        window.location.href = "../../index.html";
    }

    if (rol) {
        etiquetaRol.innerText = "Sesión iniciada como: " + rol;
    }

    // 4. Lógica del botón Salir
    const btnSalir = document.getElementById('btnSalir');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            // Limpiamos los datos de sesión al salir
            localStorage.removeItem("nombreUsuarioLogueado");
            localStorage.removeItem("rolUsuarioLogueado");
            localStorage.removeItem("ciUsuarioLogueado");
            // El enlace HTML hará el resto (redirigir al index)
        });
    }
});