function abrirModalSalir() {

    let modal = document.getElementById('modalLogoutContenedor');
    if (modal) {
        modal.style.display = 'flex';
        return;
    }

    const estilos = `
    <style id="estilos-logout">
        #modalLogoutContenedor {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.4); 
            backdrop-filter: blur(5px); 
            display: flex; justify-content: center; align-items: center;
            z-index: 999999; font-family: sans-serif;
        }
        .modal-emergente {
            background: white; padding: 30px; border-radius: 15px;
            text-align: center; width: 350px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: entradaModal 0.3s ease-out;
        }
        @keyframes entradaModal {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .btns-group { display: flex; gap: 15px; margin-top: 25px; }
        .btn-l { flex: 1; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
        .btn-cancel { background: #eee; color: #444; }
        .btn-exit { background: #d9534f; color: white; }
    </style>`;
    document.head.insertAdjacentHTML('beforeend', estilos);

    const htmlModal = `
    <div id="modalLogoutContenedor">
        <div class="modal-emergente">
            <h2 style="margin-top:0; color:#333;">¿Cerrar Sesión?</h2>
            <p style="color:#666;">Estas seguro de salida.</p>
            <div class="btns-group">
                <button class="btn-l btn-cancel" onclick="cerrarModalSalir()">Volver</button>
                <button id="btnConfirmarFinal" class="btn-l btn-exit">Salir</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', htmlModal);


    document.getElementById('btnConfirmarFinal').onclick = async function() {
        this.disabled = true;
        this.innerText = "Cerrando...";

        try {

            let ruta = (window.location.pathname.includes('/pantallas/')) ? "../../php/logout.php" : "php/logout.php";


            if (window.location.pathname.split('/').length > 5) ruta = "../../../php/logout.php";

            await fetch(ruta);
        } catch (e) {
            console.error("Error al registrar salida");
        } finally {
            localStorage.clear();

            let rutaIndex = (window.location.pathname.includes('/pantallas/')) ? "../../index.html" : "index.html";
            if (window.location.pathname.split('/').length > 5) rutaIndex = "../../../index.html";
            window.location.href = rutaIndex;
        }
    };
}

function cerrarModalSalir() {
    const modal = document.getElementById('modalLogoutContenedor');
    if (modal) modal.style.display = 'none';
}