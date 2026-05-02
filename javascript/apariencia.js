(function() {
    const scripts = document.getElementsByTagName('script');
    let baseUrl = '';
    for (let s of scripts) {
        if (s.src && s.src.includes('apariencia.js')) {
            baseUrl = s.src.split('javascript/apariencia.js')[0];
            break;
        }
    }

    if (!baseUrl) {
        baseUrl = '/';
    }

    const phpUrl = baseUrl + 'php/obtener_apariencia.php';
    const imgBase = baseUrl + 'imagenes/';

    fetch(phpUrl)
        .then(r => r.json())
        .then(data => {
            const color = data.color_tema || '#c54b00';
            const fondo = data.fondo_sistema || 'frente.png';
            const logo = data.logo_sistema || 'Picsart_25-11-28_15-24-13-139.png';

            const ts = new Date().getTime();

            const root = document.documentElement;
            root.style.setProperty('--color-tema', color);
            root.style.setProperty('--color-tema-hover', shadeColor(color, -20));
            root.style.setProperty('--fondo-sistema', `url('${imgBase}${fondo}?v=${ts}')`);

            const logoLogin = document.querySelector('.icono img');
            if (logoLogin) logoLogin.src = `${imgBase}${logo}?v=${ts}`;

            const logoBienvenida = document.querySelector('.imagen-central');
            if (logoBienvenida) logoBienvenida.src = `${imgBase}${logo}?v=${ts}`;
        })
        .catch(() => {});

    function shadeColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
        const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    }

    function inyectarReloj() {
        const aside = document.querySelector('.ancho_linea');
        if (!aside) return;
        if (document.getElementById('reloj-lateral')) return;

        const relojDiv = document.createElement('div');
        relojDiv.id = 'reloj-lateral';
        relojDiv.style.marginTop = 'auto';
        relojDiv.style.paddingTop = '15px';
        relojDiv.style.borderTop = '1px solid rgba(255,255,255,0.2)';
        relojDiv.style.fontSize = '12px';
        relojDiv.style.textAlign = 'center';
        relojDiv.style.color = 'rgba(255,255,255,0.9)';
        relojDiv.style.paddingBottom = '30px';

        aside.appendChild(relojDiv);

        function actualizar() {
            const ahora = new Date();
            const fecha = ahora.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const hora = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            relojDiv.innerHTML = `<div style="font-size:11px; opacity:0.8;">${fecha}</div><div style="font-size: 1.2rem; font-weight: bold; margin-top: 5px;">${hora}</div>`;
        }

        actualizar();
        setInterval(actualizar, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inyectarReloj);
    } else {
        inyectarReloj();
    }
})();