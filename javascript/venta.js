/**
 * ESTADO GLOBAL
 */
let carrito = [];
let tasaDolar = parseFloat(localStorage.getItem("tasaDolar")) || 0;
let timeoutBusqueda;
let productoTemporal = null;

/**
 * INICIALIZACIÓN
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Mostrar tasa guardada
    const displayTasa = document.getElementById("valorTasaDisplay");
    if (displayTasa) displayTasa.innerText = tasaDolar.toFixed(2);

    verificarEstadoCliente();
    actualizarTablaFactura();
    configurarTeclasEnter();

    // 2. Vincular botón de finalizar venta
    const btnAbrir = document.getElementById("abrirModal");
    if (btnAbrir) {
        btnAbrir.onclick = () => {
            if (carrito.length > 0) document.getElementById("miModal").style.display = "flex";
            else alert("El carrito está vacío.");
        };
    }
});

/**
 * 1. GESTIÓN DE CLIENTE
 */
function verificarEstadoCliente() {
    const statusDiv = document.getElementById("statusCliente");
    const clienteData = JSON.parse(localStorage.getItem("clienteActual"));

    if (clienteData) {
        statusDiv.className = "status-cliente-container cliente-cargado";
        statusDiv.innerHTML = `
            👤 ${clienteData.nombre} 
            <span onclick="quitarCliente()" style="cursor:pointer; color:#e74c3c; font-weight:bold; margin-left:10px;">[X]</span>
        `;
    } else {
        statusDiv.className = "status-cliente-container no-cliente";
        statusDiv.innerHTML = "⚠️ No hay cliente cargado";
    }
}

function quitarCliente() {
    localStorage.removeItem("clienteActual");
    verificarEstadoCliente();
}

/**
 * 2. SOPORTE PARA TECLA ENTER
 */
function configurarTeclasEnter() {
    document.getElementById("buscar").addEventListener("keypress", (e) => {
        if (e.key === "Enter") buscarProducto();
    });

    const mapeo = [
        { id: "inputNuevaTasa", func: guardarNuevaTasa },
        { id: "inputMontoBsManual", func: guardarMontoBsManual },
        { id: "inputCantidadProducto", func: confirmarAgregarCarrito }
    ];

    mapeo.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            el.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    item.func();
                }
            });
        }
    });
}

/**
 * 3. BUSCADOR
 */
async function buscarProducto() {
    const q = document.getElementById("buscar").value.trim();
    const tbody = document.getElementById("tablaBusqueda");

    if (q.length < 1) {
        tbody.innerHTML = "";
        return;
    }

    try {
        const res = await fetch(`../../../php/buscar_productos_venta.php?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        tbody.innerHTML = "";

        data.forEach(p => {
            let pFinal = parseFloat(p.precio);
            if (p.iva && (p.iva > 0 || p.iva === "Si" || p.iva == 1)) pFinal *= 1.16;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>$${pFinal.toFixed(2)}</td>
                <td>${p.unidades}</td>
                <td><button class="icono-agregar" onclick='abrirModalCantidad(${JSON.stringify({
                    codigo: p.codigo, nombre: p.nombre, precio: pFinal, stock: p.unidades
                })})'>➕</button></td>
            `;
            tbody.appendChild(fila);
        });
    } catch (e) { console.error("Error:", e); }
}

/**
 * 4. CARRITO (LÓGICA DE UNIFICACIÓN)
 */
function actualizarTablaFactura() {
    const tbody = document.getElementById("tablaFactura");
    let total = 0;
    tbody.innerHTML = "";

    carrito.forEach((p, i) => {
        const sub = p.cantidadFactura * p.precio;
        total += sub;
        tbody.innerHTML += `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>${p.cantidadFactura}</td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>$${sub.toFixed(2)}</td>
                <td style="text-align:center;">
                    <button class="icono-eliminar" onclick="eliminarDelCarrito(${i})">🗑️</button>
                </td>
            </tr>`;
    });

    document.getElementById("montoTotal").innerText = total.toFixed(2);
    document.getElementById("montoBolivares").innerText = (total * tasaDolar).toLocaleString('es-VE', { minimumFractionDigits: 2 });
}

function confirmarAgregarCarrito() {
    const inputCant = document.getElementById("inputCantidadProducto");
    const cant = parseInt(inputCant.value);

    if (cant > 0 && productoTemporal) {
        // BUSCAR SI EL PRODUCTO YA ESTÁ EN EL CARRITO
        const indiceExistente = carrito.findIndex(item => item.codigo === productoTemporal.codigo);

        if (indiceExistente !== -1) {
            // SI EXISTE: Validamos stock sumando lo actual + lo nuevo
            const nuevaCantidadTotal = carrito[indiceExistente].cantidadFactura + cant;

            if (nuevaCantidadTotal > productoTemporal.stock) {
                alert(`Stock insuficiente. Ya tienes ${carrito[indiceExistente].cantidadFactura} en el carrito y el máximo es ${productoTemporal.stock}`);
                return;
            }
            // Actualizamos la cantidad en la fila existente
            carrito[indiceExistente].cantidadFactura = nuevaCantidadTotal;
        } else {
            // SI NO EXISTE: Validamos stock simple y agregamos
            if (cant > productoTemporal.stock) return alert("Stock insuficiente");
            carrito.push({...productoTemporal, cantidadFactura: cant });
        }

        actualizarTablaFactura();
        cerrarModal('modalCantidad');

        // Limpiar buscador e input de cantidad
        inputCant.value = "";
        document.getElementById("buscar").value = "";
        document.getElementById("buscar").focus();
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarTablaFactura();
}

/**
 * 5. MODALES Y TASA
 */
function abrirModalCantidad(p) {
    productoTemporal = p;
    document.getElementById("tituloModalCantidad").innerText = p.nombre;
    document.getElementById("stockDisponible").innerText = p.stock;
    document.getElementById("modalCantidad").style.display = "flex";
    setTimeout(() => document.getElementById("inputCantidadProducto").focus(), 100);
}

function cambiarTasa() {
    document.getElementById("modalTasa").style.display = "flex";
    setTimeout(() => document.getElementById("inputNuevaTasa").focus(), 100);
}

function guardarNuevaTasa() {
    const v = parseFloat(document.getElementById("inputNuevaTasa").value);
    if (v > 0) {
        tasaDolar = v;
        localStorage.setItem("tasaDolar", v);
        document.getElementById("valorTasaDisplay").innerText = v.toFixed(2);
        actualizarTablaFactura();
        cerrarModal('modalTasa');
    }
}

function agregarMontoBolivares() {
    if (tasaDolar <= 0) return alert("Establezca la tasa primero");
    document.getElementById("modalMontoBs").style.display = "flex";
}

function guardarMontoBsManual() {
    const inputBs = document.getElementById("inputMontoBsManual");
    const m = parseFloat(inputBs.value);
    if (m > 0) {
        // Opcional: Unificar montos manuales también
        const indexManual = carrito.findIndex(p => p.codigo === "MANUAL-BS");

        if (indexManual !== -1) {
            carrito[indexManual].precio += (m / tasaDolar);
        } else {
            carrito.push({
                codigo: "MANUAL-BS",
                nombre: "Monto Adicional Bs.",
                cantidadFactura: 1,
                precio: m / tasaDolar,
                stock: 9999
            });
        }

        actualizarTablaFactura();
        inputBs.value = "";
        cerrarModal('modalMontoBs');
    }
}

/**
 * 6. PROCESAR PAGO
 */
async function procesarPago(metodo) {
    const cliente = JSON.parse(localStorage.getItem("clienteActual"));
    try {
        const res = await fetch('../../../php/procesar_venta.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carrito, metodo_pago: metodo, cliente, tasa: tasaDolar })
        });

        const data = await res.json();

        if (data.status === "ok") {
            localStorage.setItem("idFacturaReciente", data.id_factura);
            localStorage.setItem("ultimaVenta", JSON.stringify(carrito));
            localStorage.setItem("metodoPagoSeleccionado", metodo);
            localStorage.setItem("tasaFactura", tasaDolar);
            localStorage.setItem("modoConsulta", "false");

            window.location.href = '../factra/fa.html';
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (e) {
        alert("Error de red o de servidor");
    }
}

/**
 * 7. UTILIDADES MODALES
 */
function cerrarModal(id) { document.getElementById(id).style.display = "none"; }

window.onclick = (e) => {
    ["miModal", "modalTasa", "modalMontoBs", "modalCantidad"].forEach(id => {
        if (e.target === document.getElementById(id)) cerrarModal(id);
    });
};