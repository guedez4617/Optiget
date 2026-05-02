let carrito = JSON.parse(localStorage.getItem("carritoTemporal")) || [];
let productoSeleccionado = null;
let indexParaRestar = null;
let tasaDolar = 1.00;
let montoBsExtra = 0;

document.addEventListener("DOMContentLoaded", async () => {
    const tasaActualizada = await actualizarTasaDesdeBCV();
    if (!tasaActualizada) await cargarTasaDesdeBD();

    if (document.getElementById("valorTasaDisplay")) document.getElementById("valorTasaDisplay").textContent = tasaDolar.toFixed(2);


    programarActualizacionTasa(2 * 60 * 60 * 1000);
    verificarCliente();
    renderizarCarrito();

    const btnFinalizar = document.getElementById("abrirModal");
    if (btnFinalizar) {
        btnFinalizar.onclick = () => {
            if (carrito.length === 0) return alert("Carrito vacío");
            abrirModalPagos();
        };
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            if (isOpen("modalCantidad")) confirmarAgregarCarrito();
            else if (isOpen("modalTasa")) guardarNuevaTasa();
            else if (isOpen("modalMontoBs")) guardarMontoBsManual();
            else if (isOpen("modalRestar")) confirmarResta();
            else if (isOpen("miModal") && document.activeElement.id === "inputMontoPago") agregarPagoMixto();
        }
        if (e.key === "Escape") {
            const modales = ["miModal", "modalTasa", "modalMontoBs", "modalCantidad", "modalRestar"];
            modales.forEach(id => cerrarModal(id));
        }
    });
});


async function cargarTasaDesdeBD() {
    try {
        const res = await fetch('../../../php/obtener_tasa.php');
        const data = await res.json();
        if (data.tasa) {
            tasaDolar = parseFloat(data.tasa);
            localStorage.setItem("tasaDolar", tasaDolar);
        }
    } catch (e) {
        console.error("Error cargando tasa:", e);
        tasaDolar = parseFloat(localStorage.getItem("tasaDolar")) || 1.00;
    }
}

async function actualizarTasaDesdeBCV() {
    try {
        const res = await fetch('../../../php/actualizar_tasa_bc_nuevo.php');
        const data = await res.json();

        if (data.status === 'ok' && data.tasa) {
            tasaDolar = parseFloat(data.tasa);
            localStorage.setItem("tasaDolar", tasaDolar);
            const display = document.getElementById("valorTasaDisplay");
            if (display) display.textContent = tasaDolar.toFixed(2);
            return true;
        }
    } catch (e) {
        console.error("Error obteniendo tasa BCV:", e);
    }
    return false;
}

async function guardarNuevaTasa() {
    const nueva = parseFloat(document.getElementById("inputNuevaTasa").value);
    if (nueva > 0) {
        tasaDolar = nueva;
        try {
            await fetch('../../../php/actualizar_tasa.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasa: tasaDolar })
            });
        } catch (e) { console.error("Error guardando tasa en BD:", e); }

        localStorage.setItem("tasaDolar", tasaDolar);
        const display = document.getElementById("valorTasaDisplay");
        if (display) display.textContent = tasaDolar.toFixed(2);

        renderizarCarrito();
        cerrarModal("modalTasa");
    }
}

function cambiarTasa() {
    const input = document.getElementById("inputNuevaTasa");
    if (input) {
        input.value = tasaDolar;
        abrirModal("modalTasa");
        setTimeout(() => input.focus(), 150);
    }
}

function agregarMontoBolivares() {
    const input = document.getElementById("inputMontoBsManual");
    if (input) {
        input.value = "";
        abrirModal("modalMontoBs");
        setTimeout(() => input.focus(), 150);
    }
}

function guardarMontoBsManual() {
    const montoBs = parseFloat(document.getElementById("inputMontoBsManual").value);
    if (isNaN(montoBs) || montoBs <= 0) {
        alert("Ingrese un monto válido");
        return;
    }

    const precioUSD = montoBs / tasaDolar;
    const itemComodin = carrito.find(i => i.codigo == "0");

    if (itemComodin) {
        itemComodin.precio += precioUSD;
        itemComodin.total_bs = itemComodin.precio * tasaDolar;
    } else {
        carrito.push({
            codigo: "0",
            nombre: "Monto Adicional",
            marca: "---",
            presentacion: "---",
            precio: precioUSD,
            tieneIva: false,
            cantidadFactura: 1,
            total_bs: montoBs
        });
    }

    renderizarCarrito();
    cerrarModal("modalMontoBs");
}

function renderizarCarrito() {
    const tabla = document.getElementById("tablaFactura");
    if (!tabla) return;

    tabla.innerHTML = "";
    let subtotalUSD = 0;
    let totalIvaUSD = 0;

    carrito.forEach((p, idx) => {
        const sub = p.cantidadFactura * p.precio;
        const iva = p.tieneIva ? (sub * 0.16) : 0;
        const totalFilaUSD = sub + iva;
        const totalFilaBS = totalFilaUSD * tasaDolar;

        p.total_bs = totalFilaBS;
        subtotalUSD += sub;
        totalIvaUSD += iva;

        tabla.innerHTML += `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>${p.marca}</td>
                <td>${p.presentacion}</td>
                <td>${p.cantidadFactura}</td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>$${sub.toFixed(2)}</td>
                <td>$${iva.toFixed(2)}</td>
                <td>$${totalFilaUSD.toFixed(2)}</td>
                <td style="font-weight: bold; color: #d35400;">Bs. ${totalFilaBS.toFixed(2)}</td>
                <td>
                    <button onclick="abrirModalRestar(${idx})" style="color:#d35400; border:none; background:none; cursor:pointer; font-weight:bold; font-size: 1.2rem;">
                        x
                    </button>
                </td>
            </tr>`;
    });

    localStorage.setItem("carritoTemporal", JSON.stringify(carrito));
    const totalUSD = subtotalUSD + totalIvaUSD;
    const totalBS = totalUSD * tasaDolar;

    document.getElementById("montoTotal").textContent = totalUSD.toFixed(2);
    document.getElementById("montoBolivares").textContent = totalBS.toFixed(2);
}

async function buscarProducto() {
    const query = document.getElementById("buscar").value;
    const tabla = document.getElementById("tablaBusqueda");
    const categoria = document.getElementById("filtroCategoria").value;

    if (query.length < 1) { tabla.innerHTML = ""; return; }

    try {
        const res = await fetch(`../../../php/buscar_productos_venta.php?q=${query}&cat=${categoria}`);
        const productos = await res.json();
        tabla.innerHTML = "";

        productos.forEach(p => {
            const tieneIva = (p.iva == 1 || p.iva == "Si");
            const ivaLabel = tieneIva ? "16%" : "0%";
            const precioUSD = parseFloat(p.precio);
            const precioConIvaUSD = tieneIva ? (precioUSD * 1.16) : precioUSD;
            const precioBS = precioConIvaUSD * tasaDolar;

            tabla.innerHTML += `
                <tr>
                    <td>${p.codigo}</td>
                    <td>${p.nombre}</td>
                    <td>${p.marca || '---'}</td>
                    <td>${p.presentacion || '---'}</td>
                    <td>$${precioUSD.toFixed(2)}</td>
                    <td>${ivaLabel}</td>
                    <td style="font-weight: bold; color: #d35400;">Bs. ${precioBS.toFixed(2)}</td>
                    <td>${p.unidades}</td>
                    <td><button class="btn-cliente" style="padding: 5px 10px;" onclick='abrirModalCantidad(${JSON.stringify(p)})'>+</button></td>
                </tr>`;
        });
    } catch (e) { console.error("Error en búsqueda:", e); }
}

function abrirModalCantidad(producto) {
    productoSeleccionado = producto;
    document.getElementById("tituloModalCantidad").textContent = producto.nombre;
    document.getElementById("stockDisponible").textContent = producto.unidades;
    const input = document.getElementById("inputCantidadProducto");
    input.value = 1;
    abrirModal("modalCantidad");
    setTimeout(() => {
        input.focus();
        input.select();
    }, 150);
}

function confirmarAgregarCarrito() {
    const cant = parseInt(document.getElementById("inputCantidadProducto").value);
    if (isNaN(cant) || cant <= 0) {
        alert("Cantidad no válida");
        return;
    }

    const itemExistente = carrito.find(i => i.codigo === productoSeleccionado?.codigo);
    const cantEnCarrito = itemExistente ? itemExistente.cantidadFactura : 0;

    if (productoSeleccionado && (cant + cantEnCarrito) > productoSeleccionado.unidades) {
        alert(`No hay suficiente stock. Disponible: ${productoSeleccionado.unidades}, En Carrito: ${cantEnCarrito}`);
        return;
    }

    const item = itemExistente;
    if (item) {
        item.cantidadFactura += cant;
        const sub = item.cantidadFactura * item.precio;
        const iva = item.tieneIva ? (sub * 0.16) : 0;
        item.total_bs = (sub + iva) * tasaDolar;
    } else {
        const precio = parseFloat(productoSeleccionado.precio);
        const tieneIva = (productoSeleccionado.iva == 1 || productoSeleccionado.iva == "Si");
        const subUSD = cant * precio;
        const ivaUSD = tieneIva ? (subUSD * 0.16) : 0;

        carrito.push({
            codigo: productoSeleccionado.codigo,
            nombre: productoSeleccionado.nombre,
            marca: productoSeleccionado.marca || '---',
            presentacion: productoSeleccionado.presentacion || '---',
            precio: precio,
            tieneIva: tieneIva,
            cantidadFactura: cant,
            total_bs: (subUSD + ivaUSD) * tasaDolar
        });
    }
    cerrarModal("modalCantidad");
    renderizarCarrito();
    document.getElementById("buscar").value = "";
    document.getElementById("buscar").focus();
    document.getElementById("tablaBusqueda").innerHTML = "";
}

function verificarCliente() {
    const nombre = localStorage.getItem("nombreClienteSeleccionado");
    const cedula = localStorage.getItem("cedulaClienteSeleccionado");
    const statusDiv = document.getElementById("statusCliente");
    if (!statusDiv) return;

    if (nombre && cedula && nombre !== "undefined") {
        statusDiv.innerHTML = `
            <b style="color: #27ae60;">CLIENTE: ${nombre.toUpperCase()}</b>
            <button onclick="limpiarCliente()" style="margin-left:10px; color:red; border:none; background:none; cursor:pointer; font-weight:bold;">X</button>
        `;
    } else {
        statusDiv.innerHTML = `<span style="color: #7f8c8d;">CLIENTE GENERAL</span>`;
        localStorage.setItem("cedulaClienteSeleccionado", "999");
    }
}

function limpiarCliente() {
    localStorage.removeItem("nombreClienteSeleccionado");
    localStorage.removeItem("cedulaClienteSeleccionado");
    verificarCliente();
}

let pagosAñadidos = [];
let monedaModalPago = "USD";

function abrirModalPagos() {
    if (carrito.length === 0) return alert("Carrito vacío");
    pagosAñadidos = [];
    monedaModalPago = "USD";
    const label = document.getElementById("labelMonedaModal");
    if (label) label.textContent = "$";
    const input = document.getElementById("inputMontoPago");
    if (input) input.value = "";
    actualizarModalPagos();
    abrirModal("miModal");
}

function toggleMonedaPagoModal() {
    monedaModalPago = (monedaModalPago === "USD") ? "BS" : "USD";
    const label = document.getElementById("labelMonedaModal");
    if (label) {
        label.textContent = (monedaModalPago === "USD") ? "$" : "Bs";
    }
    
    const input = document.getElementById("inputMontoPago");
    if (input && input.value !== "") {
        let currentVal = parseFloat(input.value);
        if (!isNaN(currentVal)) {
            if (monedaModalPago === "BS") {
                input.value = (currentVal * tasaDolar).toFixed(2);
            } else {
                input.value = (currentVal / tasaDolar).toFixed(2);
            }
        }
    }

    onMontoIGTFChange();
}

function actualizarModalPagos() {
    let subtotalUSD = 0;
    let totalIvaUSD = 0;
    carrito.forEach(p => {
        const sub = p.cantidadFactura * p.precio;
        const iva = p.tieneIva ? (sub * 0.16) : 0;
        subtotalUSD += sub;
        totalIvaUSD += iva;
    });
    const totalUSD = subtotalUSD + totalIvaUSD;

    let totalPagado = 0;
    pagosAñadidos.forEach(p => totalPagado += p.monto);

    const restante = totalUSD - totalPagado;

    document.getElementById("modalTotalPagar").textContent = "$" + totalUSD.toFixed(2);
    if(document.getElementById("modalTotalPagarBs")) document.getElementById("modalTotalPagarBs").textContent = (totalUSD * tasaDolar).toFixed(2);

    document.getElementById("modalTotalPagado").textContent = "$" + totalPagado.toFixed(2);
    if(document.getElementById("modalTotalPagadoBs")) document.getElementById("modalTotalPagadoBs").textContent = (totalPagado * tasaDolar).toFixed(2);

    document.getElementById("modalRestante").textContent = "$" + Math.max(0, restante).toFixed(2);
    if(document.getElementById("modalRestanteBs")) document.getElementById("modalRestanteBs").textContent = (Math.max(0, restante) * tasaDolar).toFixed(2);

    const lista = document.getElementById("listaPagosAgregados");
    lista.innerHTML = "";
    pagosAñadidos.forEach((p, idx) => {
        const esIGTF = p.esIGTF === true;
        const colorFondo = esIGTF ? '#fff8e1' : '';
        const colorTexto = esIGTF ? '#e67e22' : '#2c3e50';
        const icono = esIGTF ? '⚠️ ' : '';
        lista.innerHTML += `
            <li style="display:flex; justify-content:space-between; padding: 5px 10px; border-bottom: 1px solid #eee; background:${colorFondo};">
                <span style="color:${colorTexto};">${icono}${p.metodo}</span>
                <span style="color:${colorTexto};">$${p.monto.toFixed(2)} 
                    ${!esIGTF ? `<button onclick="eliminarPagoMixto(${idx})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold; margin-left:10px;">X</button>` : ''}
                </span>
            </li>
        `;
    });

    const inputMonto = document.getElementById("inputMontoPago");
    if (restante > 0) {
        if (monedaModalPago === "USD") {
            inputMonto.value = restante.toFixed(2);
        } else {
            inputMonto.value = (restante * tasaDolar).toFixed(2);
        }
    } else {
        inputMonto.value = "";
    }
}

function onMetodoCambio() {
    const metodo = document.getElementById('selectMetodoPago').value;
    const alerta = document.getElementById('alertaIGTF');
    if (metodo === 'Efectivo USD') {
        alerta.style.display = 'block';
        onMontoIGTFChange();
    } else {
        alerta.style.display = 'none';
    }
}

function onMontoIGTFChange() {
    const metodo = document.getElementById('selectMetodoPago').value;
    if (metodo !== 'Efectivo USD') return;
    let montoEscrito = parseFloat(document.getElementById('inputMontoPago').value) || 0;
    
    let montoUSD = (monedaModalPago === "USD") ? montoEscrito : (montoEscrito / tasaDolar);
    
    const igtf = montoUSD * 0.03;
    const total = montoUSD + igtf;
    document.getElementById('montoIGTFPreview').textContent = '$' + igtf.toFixed(2);
    document.getElementById('totalConIGTFPreview').textContent = '$' + total.toFixed(2);
}

function agregarPagoMixto() {
    const metodo = document.getElementById('selectMetodoPago').value;
    let montoEscrito = parseFloat(document.getElementById('inputMontoPago').value);

    if (isNaN(montoEscrito) || montoEscrito <= 0) {
        alert('Ingrese un monto válido');
        return;
    }

    let montoUSD = (monedaModalPago === "USD") ? montoEscrito : (montoEscrito / tasaDolar);

    // Calcular restante actual
    let subtotalUSD = 0;
    let totalIvaUSD = 0;
    carrito.forEach(p => {
        subtotalUSD += p.cantidadFactura * p.precio;
        if (p.tieneIva) totalIvaUSD += (p.cantidadFactura * p.precio * 0.16);
    });
    let totalPagado = 0;
    pagosAñadidos.forEach(p => totalPagado += p.monto);
    const restante = (subtotalUSD + totalIvaUSD) - totalPagado;

    if (montoUSD > restante + 0.01) {
        alert("El monto ingresado es mayor al restante a pagar.");
        return;
    }

    if (metodo === 'Efectivo USD') {
        const igtf = parseFloat((montoUSD * 0.03).toFixed(2));
        pagosAñadidos.push({ metodo: 'Efectivo USD', monto: montoUSD });
        pagosAñadidos.push({ metodo: 'IGTF (3%)', monto: igtf, esIGTF: true });
    } else {
        pagosAñadidos.push({ metodo, monto: montoUSD });
    }

    document.getElementById('alertaIGTF').style.display = 'none';
    document.getElementById('inputMontoPago').value = "";
    actualizarModalPagos();
}

function eliminarPagoMixto(index) {
    // Si el pago que se borra es Efectivo USD, también borrar el IGTF que sigue
    if (pagosAñadidos[index] && pagosAñadidos[index].metodo === 'Efectivo USD') {
        const siguiente = pagosAñadidos[index + 1];
        if (siguiente && siguiente.esIGTF) {
            pagosAñadidos.splice(index, 2); // borra el USD y el IGTF juntos
        } else {
            pagosAñadidos.splice(index, 1);
        }
    } else {
        pagosAñadidos.splice(index, 1);
    }
    actualizarModalPagos();
}

function cerrarModalPagos() {
    cerrarModal("miModal");
}

async function enviarFactura() {
    let subtotalUSD = 0;
    let totalIvaUSD = 0;
    carrito.forEach(p => {
        const sub = p.cantidadFactura * p.precio;
        const iva = p.tieneIva ? (sub * 0.16) : 0;
        subtotalUSD += sub;
        totalIvaUSD += iva;
    });
    const totalUSD = subtotalUSD + totalIvaUSD;

    let totalPagado = 0;
    pagosAñadidos.forEach(p => totalPagado += p.monto);

    const restante = totalUSD - totalPagado;

    if (restante > 0.01) {
        const cedula = localStorage.getItem("cedulaClienteSeleccionado");
        if (!cedula || cedula === "999") {
            alert("Como no se cubrió el total, la factura quedará a Crédito. Debe cargar un cliente específico para ventas a Crédito.");
            return;
        }
    }

    const datos = {
        carrito,
        pagos: pagosAñadidos,
        tasa: tasaDolar,
        monto_bs_extra: 0,
        cliente: { cedula: localStorage.getItem("cedulaClienteSeleccionado") || "999" }
    };

    try {
        const res = await fetch("../../../php/procesar_venta.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        const r = await res.json();
        if (r.status === "ok") {
            localStorage.setItem("idFacturaReciente", r.id_factura);
            localStorage.removeItem("nombreClienteSeleccionado");
            localStorage.removeItem("cedulaClienteSeleccionado");
            localStorage.removeItem("carritoTemporal");
            window.location.href = "../factra/fa.html";
        } else alert(r.mensaje);
    } catch (e) { alert("Error de servidor"); }
}

function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.setProperty("display", "flex", "important");
    }
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
}

function isOpen(id) {
    const el = document.getElementById(id);
    return el && (el.style.display === "flex" || el.style.display === "block");
}

function abrirModalRestar(idx) {
    indexParaRestar = idx;
    const producto = carrito[idx];
    document.getElementById("tituloModalRestar").textContent = "Quitar de: " + producto.nombre;
    document.getElementById("cantActual").textContent = producto.cantidadFactura;
    const input = document.getElementById("inputCantidadRestar");
    input.value = 1;
    input.max = producto.cantidadFactura;
    abrirModal("modalRestar");
    setTimeout(() => {
        input.focus();
        input.select();
    }, 150);
}

function confirmarResta() {
    const cantQuitar = parseInt(document.getElementById("inputCantidadRestar").value);
    if (isNaN(cantQuitar) || cantQuitar <= 0) return;
    const producto = carrito[indexParaRestar];

    if (cantQuitar >= producto.cantidadFactura) {
        carrito.splice(indexParaRestar, 1);
    } else {
        producto.cantidadFactura -= cantQuitar;
        const sub = producto.cantidadFactura * producto.precio;
        const iva = producto.tieneIva ? (sub * 0.16) : 0;
        producto.total_bs = (sub + iva) * tasaDolar;
    }
    cerrarModal("modalRestar");
    renderizarCarrito();
}

// Programa la actualización automática de la tasa.
function programarActualizacionTasa(intervalMs) {
    // Llamada periódica
    setInterval(async () => {
        const ok = await actualizarTasaDesdeBCV();
        if (!ok) await cargarTasaDesdeBD();
        // Actualizar elementos visuales y carrito si existen
        const display = document.getElementById("valorTasaDisplay");
        if (display) display.textContent = tasaDolar.toFixed(2);
        try { renderizarCarrito(); } catch (e) { /* si no existe la UI, ignorar */ }
    }, intervalMs);
}