// 1. VARIABLES GLOBALES
let monedaActual = "USD";

document.addEventListener("DOMContentLoaded", () => {
    cargarDeudores();

    // Filtro de búsqueda en tiempo real
    const inputBusq = document.getElementById('inputBusqueda');
    if (inputBusq) {
        inputBusq.addEventListener('input', function(e) {
            const busqueda = e.target.value.toLowerCase();
            const filas = document.querySelectorAll('#cuerpoTablaDeudores tr');
            filas.forEach(fila => {
                const texto = fila.innerText.toLowerCase();
                fila.style.display = texto.includes(busqueda) ? '' : 'none';
            });
        });
    }
});

// 2. CARGAR LISTA DE CLIENTES CON DEUDA
async function cargarDeudores() {
    try {
        // ASEGÚRATE: El nombre del archivo debe ser exacto al que creamos (resumen_creditos.php)
        const resp = await fetch('../../../php/obtener_resumen_creditos.php');

        // Verificamos si la respuesta es exitosa antes de parsear
        if (!resp.ok) throw new Error("Error en la red");

        const deudores = await resp.json();
        const tabla = document.getElementById('cuerpoTablaDeudores');

        if (!tabla) return;
        tabla.innerHTML = "";

        // Si el PHP devuelve un error de base de datos
        if (deudores.status === "error") {
            console.error("Error servidor:", deudores.message);
            tabla.innerHTML = `<tr><td colspan='6' style='text-align:center; color:red;'>Error: ${deudores.message}</td></tr>`;
            return;
        }

        // Si no hay deudores (el array viene vacío)
        if (!deudores || deudores.length === 0) {
            tabla.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No hay deudas pendientes</td></tr>";
            return;
        }

        // Renderizar filas
        deudores.forEach(d => {
            const saldo = parseFloat(d.saldo_pendiente || 0);
            tabla.innerHTML += `
                <tr>
                    <td>${d.cedula}</td>
                    <td>${d.NOMBRE}</td>
                    <td>${d.telefono}</td>
                    <td>${d.direccion}</td>
                    <td><b style="color: #c54b00;">${saldo.toFixed(2)} $</b></td>
                    <td>
                        <button class="btn-detalle" onclick="abrirModal('${d.cedula}', '${d.NOMBRE}')">
                            Abonar
                        </button>
                    </td>
                </tr>`;
        });
    } catch (error) {
        console.error("Error al cargar deudores:", error);
        const tabla = document.getElementById('cuerpoTablaDeudores');
        if (tabla) tabla.innerHTML = "<tr><td colspan='6' style='text-align:center; color:red;'>Error de conexión con el servidor</td></tr>";
    }
}

// 3. ABRIR EL MODAL Y CARGAR FACTURAS DEL CLIENTE
async function abrirModal(cedula, nombre) {
    const modal = document.getElementById('modalAbonos');
    const contenedor = document.getElementById('contenidoDetalle');
    if (modal) modal.style.display = "block";

    try {
        const resp = await fetch(`../../../php/detalle_facturas_cliente.php?cedula=${cedula}`);
        const facturas = await resp.json();

        let totalGeneralDeuda = 0;
        contenedor.innerHTML = "";

        if (!facturas || facturas.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center;'>No se encontraron facturas pendientes.</p>";
        } else {
            facturas.forEach(f => {
                const monto = parseFloat(f.monto_factura || 0);
                const abonado = parseFloat(f.total_abonado || 0);
                const saldoPendiente = monto - abonado;

                if (saldoPendiente > 0.01) {
                    totalGeneralDeuda += saldoPendiente;
                    contenedor.innerHTML += `
                        <div class="factura-card">
                            <div class="factura-header">Factura #${f.id_factura}</div>
                            <div class="factura-monto">Faltan: <b>${saldoPendiente.toFixed(2)} $</b></div>
                            <div class="factura-fecha">${f.fecha}</div>
                        </div>`;
                }
            });
        }

        document.getElementById('tituloModal').innerHTML =
            `${nombre} <span style="color: #888; font-size: 0.8em;">(Deuda Total: ${totalGeneralDeuda.toFixed(2)} $)</span>`;
        document.getElementById('cedulaDetalle').innerText = cedula;

        // Resetear campos
        document.getElementById('tasaDia').value = parseFloat(localStorage.getItem("tasaDolar") || 1).toFixed(2);
        document.getElementById('montoInput').value = "";
        document.getElementById('montoConvertido').innerText = "0.00";
        actualizarEtiquetas();

    } catch (error) {
        console.error("Error al abrir modal:", error);
    }
}

// 4. LÓGICA DE MONEDA
function cambiarMoneda() {
    monedaActual = (monedaActual === "USD") ? "BS" : "USD";
    actualizarEtiquetas();
    document.getElementById('montoInput').value = "";
    document.getElementById('montoConvertido').innerText = "0.00";
}

function actualizarEtiquetas() {
    const labelMonto = document.getElementById('labelMonto');
    const labelVisor = document.getElementById('labelVisor');
    const unidadVisor = document.getElementById('unidadVisor');

    if (monedaActual === "USD") {
        labelMonto.innerText = "Monto a Abonar ($)";
        labelVisor.innerText = "Equivalente en Bolívares";
        unidadVisor.innerText = "BS";
    } else {
        labelMonto.innerText = "Monto a Abonar (BS)";
        labelVisor.innerText = "Equivalente en Dólares";
        unidadVisor.innerText = "$";
    }
}

function calcularAbono() {
    const tasa = parseFloat(document.getElementById('tasaDia').value) || 0;
    const monto = parseFloat(document.getElementById('montoInput').value) || 0;
    const visor = document.getElementById('montoConvertido');

    if (tasa <= 0 || monto <= 0) {
        visor.innerText = "0.00";
        return;
    }
    visor.innerText = (monedaActual === "USD") ? (monto * tasa).toFixed(2) : (monto / tasa).toFixed(2);
}

// 5. PROCESAR ABONO
async function procesarAbono() {
    const cedula = document.getElementById('cedulaDetalle').innerText;
    const tasa = parseFloat(document.getElementById('tasaDia').value);
    const montoEscrito = parseFloat(document.getElementById('montoInput').value);
    const metodo = document.getElementById('metodoPago').value;

    if (!montoEscrito || montoEscrito <= 0) {
        alert("Por favor, ingrese un monto válido.");
        return;
    }

    let montoUSD = (monedaActual === "USD") ? montoEscrito : (montoEscrito / tasa);

    const datos = {
        cedula_cliente: cedula,
        monto_abonado: montoUSD.toFixed(2),
        metodo_pago: metodo,
        tasa: tasa
    };

    try {
        const resp = await fetch('../../../php/registrar_abono.php', {
            method: 'POST',
            body: JSON.stringify(datos),
            headers: { 'Content-Type': 'application/json' }
        });

        const res = await resp.json();
        if (res.status === "success") {
            alert("✅ Abono registrado correctamente.");
            cerrarModal();
            cargarDeudores();
        } else {
            alert("❌ Error: " + res.message);
        }
    } catch (e) {
        console.error("Error:", e);
        alert("No se pudo procesar el abono.");
    }
}

function cerrarModal() {
    document.getElementById('modalAbonos').style.display = "none";
}

window.onclick = (event) => {
    if (event.target == document.getElementById('modalAbonos')) cerrarModal();
}