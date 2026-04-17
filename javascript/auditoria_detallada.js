async function buscarHistorialDetallado() {
    const ci = document.getElementById('inputCI').value;
    const contenedor = document.getElementById('contenedorHistorial');

    if (!ci) {
        alert("Por favor, ingresa una Cédula de Identidad.");
        return;
    }

    contenedor.innerHTML = "<p style='text-align:center;'>Buscando información de Sherlock Holmes...</p>";

    try {
        const response = await fetch(`../../../php/obtener_detalle_auditoria.php?ci=${ci}`);
        const sesiones = await response.json();

        if (sesiones.error) {
            contenedor.innerHTML = `<p style='color:red;'>Error: ${sesiones.error}</p>`;
            return;
        }

        if (sesiones.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center;'>No se encontró actividad para este usuario.</p>";
            return;
        }

        contenedor.innerHTML = "";

        sesiones.forEach(sesion => {
            let movimientosHtml = "";
            if (sesion.movimientos.length === 0) {
                movimientosHtml = "<p style='color:#999; font-style:italic;'>No registró acciones en esta sesión.</p>";
            } else {
                movimientosHtml = `<ul>`;
                sesion.movimientos.forEach(m => {
                    movimientosHtml += `
                        <li style="margin-bottom: 8px; border-bottom: 1px solid #f0f0f0; padding-bottom: 5px;">
                            <span style="color:#007bff; font-weight:bold;">[${new Date(m.fecha).toLocaleTimeString()}]</span> 
                            <strong>${m.accion}:</strong> ${m.detalles}
                        </li>`;
                });
                movimientosHtml += `</ul>`;
            }
            const card = `
                <div class="sesion-card" style="background:white; margin-bottom:20px; padding:20px; border-radius:10px; box-shadow:0 4px 6px rgba(0,0,0,0.1); border-left: 5px solid #007bff;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom: 2px solid #eee; padding-bottom:10px;">
                        <span style="font-size:1.1rem;">📅 <strong>Sesión:</strong> ${new Date(sesion.inicio).toLocaleString()}</span>
                        <span style="color:#666;">🏁 <strong>Fin:</strong> ${sesion.fin === "Sesión aún abierta" ? "<b style='color:green;'>Activa</b>" : sesion.fin}</span>
                    </div>
                    <div class="movimientos-container">
                        <h4 style="margin-bottom:10px; color:#333;">Actividad detectada:</h4>
                        ${movimientosHtml}
                    </div>
                </div>
            `;
            contenedor.innerHTML += card;
        });

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = "<p>Ocurrió un error al conectar con el servidor.</p>";
    }
}