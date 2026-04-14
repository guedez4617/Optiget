// permisos.js

const inicializarSeguridad = () => {
    const rol = localStorage.getItem("rol");
    const permisosRaw = localStorage.getItem("permisos");

    if (!rol && !permisosRaw) {
        console.warn("⚠️ No se encontró sesión activa.");
        return;
    }

    const permisos = permisosRaw ? JSON.parse(permisosRaw) : [];

    console.group("🛡️ Verificación de Seguridad Relacional");
    console.log("Rol:", rol);
    console.log("Permisos:", permisos);
    console.groupEnd();

    /**
     * Agregamos 'seccion-negocio' y 'seccion-apariencia' a la lista.
     * Estos deben coincidir con los IDs en tu HTML y con los nombre_permiso en tu BD.
     */
    const todasLasOpciones = [
        'opcion-panel',
        'opcion-usuarios',
        'opcion-creditos',
        'opcion-facturacion',
        'opcion-historial',
        'opcion-almacen',
        'opcion-configuracion',
        'seccion-negocio',
        'seccion-apariencia'
    ];

    todasLasOpciones.forEach(idHtml => {
        const elemento = document.getElementById(idHtml);

        if (elemento) {
            if (!permisos.includes(idHtml)) {
                // OCULTAR
                elemento.style.setProperty('display', 'none', 'important');
            } else {
                // MOSTRAR
                // Si es una sección (cuadro), usamos 'block'. Si es del menú (li), usamos 'list-item'.
                const displayType = elemento.tagName === 'SECTION' ? 'block' : 'list-item';
                elemento.style.setProperty('display', displayType, 'important');
            }
        }
    });
};

// --- EJECUCIÓN ---
document.addEventListener("DOMContentLoaded", inicializarSeguridad);

window.addEventListener("load", () => {
    setTimeout(inicializarSeguridad, 100);
});