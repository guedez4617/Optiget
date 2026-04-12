const aplicarRestricciones = () => {
    const permisosRaw = localStorage.getItem("permisos");
    const rol = localStorage.getItem("rol");
    const permisos = permisosRaw ? JSON.parse(permisosRaw) : [];

    console.group("Verificando Accesos");
    console.log("Rol:", rol);
    console.groupEnd();

    // 1. Regla del Gerente
    if (rol && rol.toLowerCase() === "gerente") {
        return;
    }

    // 2. Mapeo
    const mapaPermisos = {
        'opcion-panel': 'menu_panel',
        'opcion-usuarios': 'menu_usuarios',
        'opcion-creditos': 'menu_creditos',
        'opcion-facturacion': 'menu_facturacion',
        'opcion-historial': 'menu_historial',
        'opcion-almacen': 'menu_almacen'
    };

    // 3. Ocultación con fuerza (usando style.setProperty)
    Object.keys(mapaPermisos).forEach(idHtml => {
        const elementoLi = document.getElementById(idHtml);
        const permisoNecesario = mapaPermisos[idHtml];

        if (elementoLi) {
            if (!permisos.includes(permisoNecesario)) {
                // Usamos !important para que el CSS de la página no lo sobrescriba
                elementoLi.style.setProperty('display', 'none', 'important');
            }
        }
    });
};

// Se ejecuta lo más pronto posible
document.addEventListener("DOMContentLoaded", aplicarRestricciones);

// Se vuelve a ejecutar cuando todo (imágenes y otros scripts) cargó
window.addEventListener("load", () => {
    // Un pequeño delay para ganar la carrera a otros scripts
    setTimeout(aplicarRestricciones, 50);
});