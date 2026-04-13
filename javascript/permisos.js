const inicializarSeguridad = () => {
    // 1. Obtener datos del almacenamiento
    const rol = localStorage.getItem("rol");
    const permisosRaw = localStorage.getItem("permisos");

    // Si no hay datos, probablemente no ha iniciado sesión
    if (!rol) {
        console.warn("⚠️ No se encontró sesión activa.");
        return;
    }

    // Convertir permisos a Array (si no existe, queda como array vacío)
    const permisos = permisosRaw ? JSON.parse(permisosRaw) : [];

    // Normalizamos el rol para evitar fallos por espacios o mayúsculas
    const rolActual = rol.trim().toLowerCase();

    console.group("🛡️ Verificación de Seguridad");
    console.log("Rol detectado:", rolActual);
    console.log("Permisos activos:", permisos);
    console.groupEnd();

    // 2. REGLA DE ORO: Gerente tiene acceso total
    if (rolActual === "gerente") {
        console.log("👑 Acceso total concedido por rango Gerente.");
        return;
    }

    // 3. MAPEO: ID del HTML vs Nombre del permiso en la Base de Datos
    const mapaPermisos = {
        'opcion-panel': 'menu_panel',
        'opcion-usuarios': 'menu_usuarios',
        'opcion-creditos': 'menu_creditos',
        'opcion-facturacion': 'menu_facturacion',
        'opcion-historial': 'menu_historial',
        'opcion-almacen': 'menu_almacen'
    };

    // 4. LÓGICA DE OCULTACIÓN AGRESIVA
    Object.keys(mapaPermisos).forEach(idHtml => {
        const elementoLi = document.getElementById(idHtml);
        const permisoNecesario = mapaPermisos[idHtml];

        if (elementoLi) {
            // Si el permiso NO está en la lista guardada...
            if (!permisos.includes(permisoNecesario)) {
                // Lo ocultamos usando !important para ganar al CSS
                elementoLi.style.setProperty('display', 'none', 'important');
            } else {
                // Si lo tiene, nos aseguramos que se vea
                elementoLi.style.setProperty('display', 'list-item', 'important');
            }
        }
    });
};

// --- MOMENTOS DE EJECUCIÓN ---

// Ejecutar cuando el HTML básico esté listo
document.addEventListener("DOMContentLoaded", inicializarSeguridad);

// Ejecutar cuando toda la página (incluidos otros JS) cargue
window.addEventListener("load", () => {
    // Retraso de 100ms para asegurar que el menú no sea modificado por otros scripts
    setTimeout(inicializarSeguridad, 100);
});