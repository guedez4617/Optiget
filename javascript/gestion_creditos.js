let monedaActual = "USD";
let deudaTotalActual = 0;

document.addEventListener("DOMContentLoaded", () => {
    cargarDeudores();


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

    window.addEventListener("click", (event) => {
        const modal = document.getElementById('modalAbonos');
        if (event.target === modal) {
            cerrarModal();
        }
    });
});

async function cargarDeudores() {
    try {
        const resp = await fetch('../../../php/obtener_resumen_creditos.php');
        if (!resp.ok) throw new Error("Error en la red al obtener créditos");

        const deudores = await resp.json();
        const tabla = document.getElementById('cuerpoTablaDeudores');
        if (!tabla) return;

        tabla.innerHTML = "";
        let granTotalCartera = 0;

        if (deudores.status === "error") {
            tabla.innerHTML = `<tr><td colspan='6' style='text-align:center; color:red;'>Error: ${deudores.message}</td></tr>`;
            return;
        }

        if (!deudores || deudores.length === 0) {
            tabla.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No hay deudas pendientes</td></tr>";
            return;
        }

        deudores.forEach(d => {
            const saldo = parseFloat(d.saldo_pendiente) || 0;
            granTotalCartera += saldo;

            tabla.innerHTML += `
                <tr>
                    <td>${d.cedula}</td>
                    <td>${d.NOMBRE}</td>
                    <td>${d.telefono || 'S/N'}</td>
                    <td>${d.direccion || 'S/D'}</td>
                    <td><b style="color: #c54b00;">${saldo.toFixed(2)} $</b></td>
                    <td>
                        <button class="btn-detalle" onclick="abrirModal('${d.cedula}', '${d.NOMBRE}')">
                            Abonar
                        </button>
                    </td>
                </tr>`;
        });

        const divTotal = document.getElementById('totalCartera');
        if (divTotal) divTotal.innerText = granTotalCartera.toFixed(2) + " $";

    } catch (error) {
        console.error("Error al cargar deudores:", error);
        const tabla = document.getElementById('cuerpoTablaDeudores');
        if (tabla) tabla.innerHTML = "<tr><td colspan='6' style='text-align:center; color:red;'>Error de conexión con el servidor</td></tr>";
    }
}

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


        deudaTotalActual = totalGeneralDeuda;


        document.getElementById('tasaDia').value = parseFloat(localStorage.getItem("tasaDolar") || 1).toFixed(2);
        document.getElementById('montoInput').value = "";
        document.getElementById('montoConvertido').innerText = "0.00";
        actualizarEtiquetas();

    } catch (error) {
        console.error("Error al abrir modal:", error);
    }
}

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

async function procesarAbono() {
    const cedulaCliente = document.getElementById('cedulaDetalle').innerText;
    const tasa = parseFloat(document.getElementById('tasaDia').value);
    const montoEscrito = parseFloat(document.getElementById('montoInput').value);
    const metodo = document.getElementById('metodoPago').value;
    const cedulaUser = localStorage.getItem("ciUsuarioLogueado");

    if (!cedulaUser) {
        alert("❌ Error: Sesión expirada o usuario no detectado. Por favor inicie sesión nuevamente.");
        return;
    }

    if (!montoEscrito || montoEscrito <= 0) {
        alert("Por favor, ingrese un monto válido.");
        return;
    }


    let montoUSD = (monedaActual === "USD") ? montoEscrito : (montoEscrito / tasa);
    if (parseFloat(montoUSD.toFixed(2)) > parseFloat(deudaTotalActual.toFixed(2))) {
        alert(`❌ El monto a abonar no puede ser mayor a la deuda total de ${deudaTotalActual.toFixed(2)} $.`);
        return;
    }

    const igtf = (metodo === 'Efectivo USD') ? parseFloat((montoUSD * 0.03).toFixed(2)) : 0;

    const datos = {
        cedula_cliente: cedulaCliente,
        cedula_usuario: cedulaUser,
        monto_abonado: montoUSD.toFixed(2),
        metodo_pago: metodo,
        igtf: igtf,
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
            alert("❌ Error del servidor: " + res.message);
        }
    } catch (e) {
        console.error("Error al procesar el abono:", e);
        alert("No se pudo procesar el abono. Verifica la conexión a internet o al servidor local.");
    }
}

function cerrarModal() {
    const modal = document.getElementById('modalAbonos');
    if (modal) modal.style.display = "none";
}