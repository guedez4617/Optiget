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

    const todasLasOpciones = [
        'opcion-panel',
        'opcion-usuarios',
        'opcion-creditos',
        'opcion-facturacion',
        'opcion-historial',
        'opcion-almacen',
        'opcion-configuracion',
        'opcion-vencer',
        'seccion-negocio',
        'seccion-apariencia'
    ];

    todasLasOpciones.forEach(idHtml => {
        const elemento = document.getElementById(idHtml);

        if (elemento) {
            if (!permisos.includes(idHtml)) {
                // Caso especial para la nueva opción de vencimientos
                if (idHtml === 'opcion-vencer' && (rol === 'Gerente' || rol === 'Almacen' || rol === 'Administrador')) {
                    elemento.style.setProperty('display', 'list-item', 'important');
                } else {
                    elemento.style.setProperty('display', 'none', 'important');
                }
            } else {
                const displayType = elemento.tagName === 'SECTION' ? 'block' : 'list-item';
                elemento.style.setProperty('display', displayType, 'important');
            }
        }
    });
};

document.addEventListener("DOMContentLoaded", inicializarSeguridad);

window.addEventListener("load", () => {
    setTimeout(inicializarSeguridad, 100);
});