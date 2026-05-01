document.addEventListener("DOMContentLoaded", () => {
    const nombreReal = localStorage.getItem("nombreUsuarioLogueado");
    const rol = localStorage.getItem("rol");

    const etiquetaNombre = document.getElementById('nombreUsuario');
    const etiquetaRol = document.getElementById('rolUsuario');

    if (nombreReal) {
        etiquetaNombre.innerText = nombreReal;
    } else {
        window.location.href = "../../index.html";
    }

    if (rol) {
        etiquetaRol.innerText = "Sesión iniciada como: " + rol;
    }

    const btnSalir = document.getElementById('btnSalir');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            localStorage.clear(); // Borra todo de un solo golpe (permisos, rol, nombre)
            window.location.href = "../../index.html";
        });
    }
});