(function() {
    const rol = localStorage.getItem("rol");
    if (rol !== "Gerente" && rol !== "Almacen" && rol !== "Administrador") {
        window.location.href = "../../inicio/inicio.html";
    }
})();

async function cargarVencimientos() {
    const tbody = document.getElementById("cuerpoTablaVencer");

    try {
        const response = await fetch('../../php/obtener_productos_vencer.php');
        const data = await response.json();

        if (data.status === "success") {
            tbody.innerHTML = "";

            if (data.lotes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:gray;">No hay productos próximos a vencer en los próximos 7 días.</td></tr>';
                return;
            }

            data.lotes.forEach(lote => {
                const fila = document.createElement("tr");
                const dias = parseInt(lote.dias_restantes);
                
                // Determinar clase de urgencia
                let claseUrgencia = "";
                let badgeClase = "";
                let textoDias = "";

                if (lote.estado_lote === 'Vencido') {
                    claseUrgencia = "vencido-removido";
                    badgeClase = "badge-removido";
                    textoDias = "Quitado por vencido";
                } else if (dias < 0) {
                    claseUrgencia = "critico";
                    badgeClase = "badge-critico";
                    textoDias = `Vencido (${Math.abs(dias)}d)`;
                } else if (dias <= 3) {
                    claseUrgencia = "critico";
                    badgeClase = "badge-critico";
                    textoDias = `${dias} días`;
                } else {
                    claseUrgencia = "advertencia";
                    badgeClase = "badge-advertencia";
                    textoDias = `${dias} días`;
                }

                fila.className = claseUrgencia;
                fila.innerHTML = `
                    <td>${lote.Codigo}</td>
                    <td>${lote.nombre}</td>
                    <td>${lote.numero_lote}</td>
                    <td>${lote.fecha_caducidad}</td>
                    <td>${lote.cantidad}</td>
                    <td><span class="badge-dias ${badgeClase}">${textoDias}</span></td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            throw new Error(data.message);
        }

    } catch (error) {
        console.error("Error al cargar vencimientos:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red; padding:20px;">Error al cargar los datos.</td></tr>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarVencimientos();
    cargarHistorial();
});

let vistaActual = 'vencer';

function alternarVista() {
    const tablaVencer = document.getElementById("tablaVencimientos");
    const tablaHistorial = document.getElementById("tablaHistorial");
    const btnAlternar = document.getElementById("btnAlternarVista");
    
    if (!tablaVencer || !tablaHistorial || !btnAlternar) {
        console.error("No se encontraron los elementos necesarios en el DOM");
        return;
    }

    if (vistaActual === 'vencer') {
        vistaActual = 'historial';
        tablaVencer.style.display = "none";
        tablaHistorial.style.display = "";
        
        document.querySelector("h1").textContent = "Historial de Cambios de Lote";
        btnAlternar.textContent = "Ver Próximos a Vencer";
    } else {
        vistaActual = 'vencer';
        tablaHistorial.style.display = "none";
        tablaVencer.style.display = "";
        
        document.querySelector("h1").textContent = "Productos Próximos a Vencer";
        btnAlternar.textContent = "Ver Historial de Cambios";
    }
}

async function cargarHistorial() {
    const tbody = document.getElementById("cuerpoTablaHistorial");

    try {
        const response = await fetch('../../php/obtener_historial_transiciones.php');
        const data = await response.json();

        if (data.status === "success") {
            tbody.innerHTML = "";

            if (data.historial.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:gray;">No hay registros de cambios de lote.</td></tr>';
                return;
            }

            data.historial.forEach(reg => {
                const fila = document.createElement("tr");
                
                // Formatear fecha
                const fechaObj = new Date(reg.fecha_transicion);
                const fechaFormat = fechaObj.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

                fila.innerHTML = `
                    <td>${fechaFormat}</td>
                    <td>${reg.codigo_producto}</td>
                    <td>${reg.producto_nombre}</td>
                    <td><span style="color: #e74c3c; font-weight: bold;">${reg.lote_agotado}</span></td>
                    <td><span style="color: #27ae60; font-weight: bold;">${reg.lote_nuevo}</span></td>
                `;
                tbody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error("Error al cargar historial:", error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red; padding:20px;">Error al cargar los datos.</td></tr>';
    }
}

function filtrarVencimientos() {
    const input = document.getElementById("buscarInputVencer").value.toLowerCase();
    const filtro = document.getElementById("filtroColumnaVencer").value;
    
    // Si estamos en la vista de vencimientos
    if (vistaActual === 'vencer') {
        const tbody = document.getElementById("cuerpoTablaVencer");
        const filas = tbody.getElementsByTagName("tr");

        for (let i = 0; i < filas.length; i++) {
            if (filas[i].cells.length === 1) continue; 

            let textoFila = "";
            if (filtro === "codigo") {
                textoFila = filas[i].cells[0].textContent.toLowerCase();
            } else if (filtro === "nombre") {
                textoFila = filas[i].cells[1].textContent.toLowerCase();
            } else if (filtro === "lote") {
                textoFila = filas[i].cells[2].textContent.toLowerCase();
            }

            if (textoFila.includes(input)) {
                filas[i].style.display = "";
            } else {
                filas[i].style.display = "none";
            }
        }
    } else {
        // Si estamos en historial, buscar en todo el texto (simplificado)
        const tbody = document.getElementById("cuerpoTablaHistorial");
        const filas = tbody.getElementsByTagName("tr");
        
        for (let i = 0; i < filas.length; i++) {
            if (filas[i].cells.length === 1) continue;
            
            const textoFila = filas[i].textContent.toLowerCase();
            if (textoFila.includes(input)) {
                filas[i].style.display = "";
            } else {
                filas[i].style.display = "none";
            }
        }
    }
}

function imprimirListaVencimientos() {
    const tablaID = vistaActual === 'vencer' ? ".producto-tabla" : "#tablaHistorial";
    const tablaOriginal = document.querySelector(tablaID);
    
    // Clonar la tabla para no modificar el DOM actual
    const tablaClon = tablaOriginal.cloneNode(true);
    tablaClon.style.display = ""; // Asegurar que sea visible al imprimir
    
    // Remover las filas que están ocultas por el filtro
    const filas = tablaClon.querySelectorAll("tbody tr");
    filas.forEach(fila => {
        if (fila.style.display === "none") {
            fila.remove();
        }
    });

    const titulo = vistaActual === 'vencer' ? "Lista de Productos Próximos a Vencer" : "Historial de Cambios de Lote";

    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    
    const htmlImpresion = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${titulo}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #333;
                }
                h1 {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                    color: #000;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 10px;
                    text-align: left;
                    font-size: 14px;
                }
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                    color: #000;
                }
                .badge-dias { font-weight: bold; }
                .badge-critico { color: #d32f2f; }
                .badge-advertencia { color: #f57c00; }
                .badge-removido { color: #7f8c8d; font-style: italic; }
            </style>
        </head>
        <body>
            <h1>${titulo}</h1>
            ${tablaClon.outerHTML}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                };
            </script>
        </body>
        </html>
    `;

    ventanaImpresion.document.open();
    ventanaImpresion.document.write(htmlImpresion);
    ventanaImpresion.document.close();
}
