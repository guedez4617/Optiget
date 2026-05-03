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

document.addEventListener("DOMContentLoaded", cargarVencimientos);

function filtrarVencimientos() {
    const input = document.getElementById("buscarInputVencer").value.toLowerCase();
    const filtro = document.getElementById("filtroColumnaVencer").value;
    const tbody = document.getElementById("cuerpoTablaVencer");
    const filas = tbody.getElementsByTagName("tr");

    for (let i = 0; i < filas.length; i++) {
        // Skip the "Cargando..." or "No hay productos" rows
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
}

function imprimirListaVencimientos() {
    const tablaOriginal = document.querySelector(".producto-tabla");
    
    // Clonar la tabla para no modificar el DOM actual
    const tablaClon = tablaOriginal.cloneNode(true);
    
    // Remover las filas que están ocultas por el filtro (si el usuario buscó algo)
    const filas = tablaClon.querySelectorAll("tbody tr");
    filas.forEach(fila => {
        if (fila.style.display === "none") {
            fila.remove();
        }
    });

    // Abrir una nueva ventana limpia
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    
    const htmlImpresion = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Lista de Productos Próximos a Vencer</title>
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
                .badge-dias {
                    font-weight: bold;
                }
                /* Limpiar estilos de insignias para impresión */
                .badge-critico { color: #d32f2f; }
                .badge-advertencia { color: #f57c00; }
                .badge-removido { color: #7f8c8d; font-style: italic; }
            </style>
        </head>
        <body>
            <h1>Lista de Productos Próximos a Vencer / Retirados</h1>
            ${tablaClon.outerHTML}
            <script>
                // Al cargar la ventana, lanzar impresión y luego cerrar
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
