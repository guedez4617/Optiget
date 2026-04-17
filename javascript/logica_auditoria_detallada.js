async function buscarHistorial() {
    const ci = document.getElementById('inputCI').value;
    const contenedor = document.getElementById('resultadoAuditoria');

    if (!ci) return alert("Por favor, ingrese una C.I.");

    contenedor.innerHTML = "<p>Buscando movimientos...</p>";

    try {
        const response = await fetch(`../../../php/obtener_detalle_auditoria.php?ci=${ci}`);
        const datos = await response.json();

        if (datos.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron sesiones para este usuario.</p>";
            return;
        }

        contenedor.innerHTML = "";

        datos.forEach(sesion => {
            let accionesHtml = "";

            if (sesion.movimientos.length === 0) {
                accionesHtml = "<p style='color:#999; margin:0;'>No hubo acciones registradas en esta sesión.</p>";
            } else {
                sesion.movimientos.forEach(acc => {
                    accionesHtml += `
                        <div class="accion-item">
                            <span><span class="tag-accion">${acc.accion}:</span> ${acc.detalles}</span>
                            <span class="hora-accion">${new Date(acc.fecha).toLocaleTimeString()}</span>
                        </div>
                    `;
                });
            }

            const card = `
                <div class="sesion-card">
                    <div style="display:flex; justify-content:space-between; font-weight:bold;">
                        <span>🚪 Inicio: ${new Date(sesion.inicio).toLocaleString()}</span>
                        <span>🏁 Fin: ${sesion.fin}</span>
                    </div>
                    <div class="lista-acciones">
                        <strong>Actividad realizada:</strong>
                        ${accionesHtml}
                    </div>
                </div>
            `;
            contenedor.innerHTML += card;
        });

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al cargar los datos.</p>";
    }
}