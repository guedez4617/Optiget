/**
 * venta.js - Sistema Don Diego
 */

let carrito = JSON.parse(localStorage.getItem("carritoTemporal")) || [];
let productoSeleccionado = null;
let tasaDolar = parseFloat(localStorage.getItem("tasaDolar")) || 1.00;
let montoBsExtra = 0;

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("valorTasaDisplay")) {
        document.getElementById("valorTasaDisplay").textContent = tasaDolar.toFixed(2);
    }
    verificarCliente();
    renderizarCarrito();

    // Evento para el botón Finalizar Venta que ya tienes con id="abrirModal"
    const btnFinalizar = document.getElementById("abrirModal");
    if (btnFinalizar) {
        btnFinalizar.onclick = () => {
            if (carrito.length === 0) return alert("Carrito vacío");
            abrirModal("miModal");
        };
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            if (isOpen("modalCantidad")) confirmarAgregarCarrito();
            else if (isOpen("modalTasa")) guardarNuevaTasa();
            else if (isOpen("modalMontoBs")) guardarMontoBsManual();
        }
        if (e.key === "Escape") {
            const modales = ["miModal", "modalTasa", "modalMontoBs", "modalCantidad"];
            modales.forEach(id => cerrarModal(id));
        }
    });
});

// --- LOGICA DE CLIENTE ---
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

// --- BUSQUEDA DE PRODUCTOS ---
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
            const ivaLabel = (p.iva == 1 || p.iva == "Si") ? "16%" : "0%";
            tabla.innerHTML += `
                <tr>
                    <td>${p.codigo}</td>
                    <td>${p.nombre}</td>
                    <td>${p.marca || '---'}</td>
                    <td>${p.presentacion || '---'}</td>
                    <td>$${parseFloat(p.precio).toFixed(2)}</td>
                    <td>${ivaLabel}</td>
                    <td>${p.unidades}</td>
                    <td><button class="btn-cliente" style="padding: 5px 10px;" onclick='abrirModalCantidad(${JSON.stringify(p)})'>+</button></td>
                </tr>`;
        });
    } catch (e) { console.error("Error en búsqueda:", e); }
}

// --- CARRITO Y MODALES DE ACCIÓN ---
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

function cambiarTasa() {
    const input = document.getElementById("inputNuevaTasa");
    input.value = tasaDolar;
    abrirModal("modalTasa");
    setTimeout(() => input.focus(), 150);
}

function agregarMontoBolivares() {
    const input = document.getElementById("inputMontoBsManual");
    input.value = "";
    abrirModal("modalMontoBs");
    setTimeout(() => input.focus(), 150);
}

function confirmarAgregarCarrito() {
    const cant = parseInt(document.getElementById("inputCantidadProducto").value);
    if (isNaN(cant) || cant <= 0 || (productoSeleccionado && cant > productoSeleccionado.unidades)) {
        alert("Cantidad no válida");
        return;
    }

    const item = carrito.find(i => i.codigo === productoSeleccionado.codigo);
    if (item) item.cantidadFactura += cant;
    else {
        carrito.push({
            codigo: productoSeleccionado.codigo,
            nombre: productoSeleccionado.nombre,
            marca: productoSeleccionado.marca || '---',
            presentacion: productoSeleccionado.presentacion || '---',
            precio: parseFloat(productoSeleccionado.precio),
            tieneIva: (productoSeleccionado.iva == 1 || productoSeleccionado.iva == "Si"),
            cantidadFactura: cant
        });
    }
    cerrarModal("modalCantidad");
    renderizarCarrito();
    document.getElementById("buscar").value = "";
    document.getElementById("buscar").focus();
    document.getElementById("tablaBusqueda").innerHTML = "";
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
                <td>$${(sub + iva).toFixed(2)}</td>
                <td><button onclick="eliminar(${idx})" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">X</button></td>
            </tr>`;
    });

    localStorage.setItem("carritoTemporal", JSON.stringify(carrito));

    const totalUSD = subtotalUSD + totalIvaUSD;
    const totalBS = (totalUSD * tasaDolar) + montoBsExtra;

    document.getElementById("montoTotal").textContent = totalUSD.toFixed(2);
    document.getElementById("montoBolivares").textContent = totalBS.toFixed(2);
}

// --- LOGICA DE GUARDADO ---
function guardarNuevaTasa() {
    const nueva = parseFloat(document.getElementById("inputNuevaTasa").value);
    if (nueva > 0) {
        tasaDolar = nueva;
        localStorage.setItem("tasaDolar", tasaDolar);
        const display = document.getElementById("valorTasaDisplay");
        if (display) display.textContent = tasaDolar.toFixed(2);
        renderizarCarrito();
        cerrarModal("modalTasa");
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
    } else {
        carrito.push({
            codigo: "0",
            nombre: "Monto Adicional",
            marca: "---",
            presentacion: "---",
            precio: precioUSD,
            tieneIva: false,
            cantidadFactura: 1
        });
    }

    renderizarCarrito();
    cerrarModal("modalMontoBs");
}

// --- FINALIZAR VENTA ---
async function procesarPago(metodo) {
    // Validar si el método es Crédito y si hay un cliente real cargado
    if (metodo === 'Crédito') {
        const cedula = localStorage.getItem("cedulaClienteSeleccionado");
        if (!cedula || cedula === "999") {
            alert("⚠️ Error: Debe cargar un cliente específico para realizar ventas a Crédito.");
            return;
        }
    }

    const datos = {
        carrito,
        metodo_pago: metodo,
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

// --- UTILIDADES ---
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        console.log("Abriendo modal: " + id); // Esto te dirá en la consola (F12) si funciona
        modal.style.setProperty("display", "flex", "important");
    } else {
        console.error("No se encontró el modal con ID: " + id);
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

function eliminar(idx) {
    carrito.splice(idx, 1);
    renderizarCarrito();
}