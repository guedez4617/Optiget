document.addEventListener("DOMContentLoaded", () => {
    // 1. Extraer los datos (USANDO LAS LLAVES CORRECTAS)
    const nombreReal = localStorage.getItem("nombreUsuarioLogueado");
    const rol = localStorage.getItem("rol"); // Antes buscabas "rolUsuarioLogueado", pero el login guarda "rol"

    // 2. Referencias a los elementos del HTML
    const etiquetaNombre = document.getElementById('nombreUsuario');
    const etiquetaRol = document.getElementById('rolUsuario');

    // 3. Insertar los datos si existen
    if (nombreReal) {
        // Si el nombre sale como "Eliezer undefined", es porque en el Login.js 
        // la variable datosUser.APELLIDO no existe o está mal escrita.
        etiquetaNombre.innerText = nombreReal;
    } else {
        // Si alguien intenta entrar sin loguearse, lo mandamos al login
        window.location.href = "../../index.html";
    }

    if (rol) {
        etiquetaRol.innerText = "Sesión iniciada como: " + rol;
    }

    // 4. Lógica del botón Salir (Vaciamos TODO el localStorage para seguridad)
    const btnSalir = document.getElementById('btnSalir');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            localStorage.clear(); // Borra todo de un solo golpe (permisos, rol, nombre)
            window.location.href = "../../index.html";
        });
    }
});