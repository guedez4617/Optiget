/**
 * apariencia.js - Script global de Optiget
 * Se inyecta en todas las páginas. Lee la configuración visual desde la BD
 * y la aplica como CSS custom properties + actualiza logos.
 */

(function () {
    // Buscar la ruta base del proyecto a partir del script apariencia.js
    const scripts = document.getElementsByTagName('script');
    let baseUrl = '';
    for (let s of scripts) {
        if (s.src && s.src.includes('apariencia.js')) {
            baseUrl = s.src.split('javascript/apariencia.js')[0];
            break;
        }
    }
    
    // Si no lo encuentra, usa la raíz relativa (fallback)
    if (!baseUrl) {
        baseUrl = '/'; 
    }

    const phpUrl = baseUrl + 'php/obtener_apariencia.php';
    const imgBase = baseUrl + 'imagenes/';

    fetch(phpUrl)
        .then(r => r.json())
        .then(data => {
            const color  = data.color_tema    || '#c54b00';
            const fondo  = data.fondo_sistema || 'frente.png';
            const logo   = data.logo_sistema  || 'Picsart_25-11-28_15-24-13-139.png';
            
            // Añadir un timestamp para evitar que el navegador cachee la imagen si se subió una nueva con el mismo nombre
            const ts = new Date().getTime();

            // ── 1. Aplicar variables CSS globales ──────────────────────────
            const root = document.documentElement;
            root.style.setProperty('--color-tema', color);
            root.style.setProperty('--color-tema-hover', shadeColor(color, -20));
            root.style.setProperty('--fondo-sistema', `url('${imgBase}${fondo}?v=${ts}')`);

            // ── 2. Actualizar logos en la página ───────────────────────────
            // Login (index.html)
            const logoLogin = document.querySelector('.icono img');
            if (logoLogin) logoLogin.src = `${imgBase}${logo}?v=${ts}`;

            // Bienvenida (inicio.html)
            const logoBienvenida = document.querySelector('.imagen-central');
            if (logoBienvenida) logoBienvenida.src = `${imgBase}${logo}?v=${ts}`;
        })
        .catch(() => { /* Si falla, el CSS usa los valores por defecto */ });

    // Oscurece / aclara un color hex
    function shadeColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
        const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    }
})();
