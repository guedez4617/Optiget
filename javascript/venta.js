/**
 * venta.js - Sistema Don Diego
 */

// MODIFICACIÓN: Cargar carrito desde LocalStorage al iniciar
let carrito = JSON.parse(localStorage.getItem("carritoTemporal")) || [];
let productoSeleccionado = null;
let tasaDolar = parseFloat(localStorage.getItem("tasaDolar")) || 1.00;
let montoBsExtra = 0;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Mostrar tasa y verificar cliente al cargar
    if (document.getElementById("valorTasaDisplay")) {
        document.getElementById("valorTasaDisplay").textContent = tasaDolar.toFixed(2);
    }
    verificarCliente();

    // MODIFICACIÓN: Renderizar el carrito guardado al cargar la página
    renderizarCarrito();

    // 2. Manejo de teclado (ENTER)
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            if (isOpen("modalCantidad")) confirmarAgregarCarrito();
            else if (isOpen("modalTasa")) guardarNuevaTasa();
            else if (isOpen("modalMontoBs")) guardarMontoBsManual();
        }
    });
});

// --- LOGICA DE CLIENTE (CONEXIÓN CON CLIENTES.JS) ---
function verificarCliente() {
    const nombre = localStorage.getItem("nombreClienteSeleccionado");
    const cedula = localStorage.getItem("cedulaClienteSeleccionado");
    const statusDiv = document.getElementById("statusCliente");

    if (!statusDiv) return;

    if (nombre && cedula && nombre !== "undefined") {
        statusDiv.innerHTML = `
            <b style="color: #27ae60;">CLIENTE: ${nombre.toUpperCase()} (${cedula})</b>
            <button onclick="limpiarCliente()" style="margin-left:10px; color:red; border:none; background:none; cursor:pointer;">[Cambiar]</button>
        `;
    } else {
        statusDiv.innerHTML = `<span style="color: #7f8c8d;">CLIENTE GENERAL (CONTADO)</span>`;
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
    if (query.length < 1) { tabla.innerHTML = ""; return; }

    try {
        const res = await fetch(`../../../php/buscar_productos_venta.php?q=${query}`);
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
                    <td><button class="btn-cliente" onclick='abrirModalCantidad(${JSON.stringify(p)})'>+</button></td>
                </tr>`;
        });
    } catch (e) { console.error(e); }
}

// --- CARRITO ---
function abrirModalCantidad(producto) {
    productoSeleccionado = producto;
    document.getElementById("tituloModalCantidad").textContent = producto.nombre;
    document.getElementById("stockDisponible").textContent = producto.unidades;

    const input = document.getElementById("inputCantidadProducto");
    input.value = 1;
    abrirModal("modalCantidad");

    setTimeout(() => {
        input.focus();
        let v = input.value;
        input.value = '';
        input.value = v;
    }, 150);
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
    let subtotalUSD = 0,
        totalIvaUSD = 0;

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
                <td><button onclick="eliminar(${idx})" style="color:red; border:none; background:none; cursor:pointer;">X</button></td>
            </tr>`;
    });

    // MODIFICACIÓN: Guardar el carrito actual en LocalStorage cada vez que se actualiza
    localStorage.setItem("carritoTemporal", JSON.stringify(carrito));

    const totalUSD = subtotalUSD + totalIvaUSD;
    const totalBS = (totalUSD * tasaDolar) + montoBsExtra;

    document.getElementById("montoTotal").textContent = totalUSD.toFixed(2);
    document.getElementById("montoBolivares").textContent = totalBS.toFixed(2);
}

// --- TASA Y MONTO EXTRA ---
function cambiarTasa() {
    document.getElementById("inputNuevaTasa").value = tasaDolar;
    abrirModal("modalTasa");
}

function guardarNuevaTasa() {
    const nueva = parseFloat(document.getElementById("inputNuevaTasa").value);
    if (nueva > 0) {
        tasaDolar = nueva;
        localStorage.setItem("tasaDolar", tasaDolar);
        document.getElementById("valorTasaDisplay").textContent = tasaDolar.toFixed(2);
        renderizarCarrito();
        cerrarModal("modalTasa");
    }
}

function agregarMontoBolivares() {
    document.getElementById("inputMontoBsManual").value = "";
    abrirModal("modalMontoBs");
}

function guardarMontoBsManual() {
    const monto = parseFloat(document.getElementById("inputMontoBsManual").value);
    if (!isNaN(monto)) {
        montoBsExtra = monto;
        renderizarCarrito();
        cerrarModal("modalMontoBs");
    }
}

// --- FINALIZAR VENTA ---
document.getElementById("abrirModal").addEventListener("click", () => {
    if (carrito.length === 0) return alert("Carrito vacío");
    abrirModal("miModal");
});

async function procesarPago(metodo) {
    const datos = {
        carrito,
        metodo_pago: metodo,
        tasa: tasaDolar,
        monto_bs_extra: montoBsExtra,
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

            // MODIFICACIÓN: Limpiar todo al finalizar con éxito
            localStorage.removeItem("nombreClienteSeleccionado");
            localStorage.removeItem("cedulaClienteSeleccionado");
            localStorage.removeItem("carritoTemporal");

            window.location.href = "../factra/fa.html";
        } else alert(r.mensaje);
    } catch (e) { alert("Error de servidor"); }
}

// --- UTILIDADES ---
function abrirModal(id) { document.getElementById(id).style.display = "flex"; }

function cerrarModal(id) { document.getElementById(id).style.display = "none"; }

function isOpen(id) {
    const el = document.getElementById(id);
    return el && (el.style.display === "flex" || el.style.display === "block");
}

function eliminar(idx) {
    carrito.splice(idx, 1);
    renderizarCarrito();
}