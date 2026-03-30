window.onload = function() {
    // 1. Mostrar Fecha
    document.getElementById('fechaFactura').innerText = new Date().toLocaleDateString();

    // 2. Cargar Datos del Cliente
    const cliente = JSON.parse(localStorage.getItem("clienteActual"));
    if (cliente) {
        document.getElementById('facNombre').innerText = cliente.nombre;
        document.getElementById('facCedula').innerText = cliente.cedula;
        document.getElementById('facTelefono').innerText = cliente.telefono;
        document.getElementById('facDireccion').innerText = cliente.direccion;
    }

    // 3. Cargar Método de Pago (El cambio importante)
    const metodo = localStorage.getItem("metodoPagoSeleccionado");
    const spanMetodo = document.getElementById('facMetodo');
    if (metodo === 'credito') {
        spanMetodo.innerText = "CRÉDITO / PENDIENTE";
        spanMetodo.className = "metodo-pago-box pago-credito";
    } else {
        spanMetodo.innerText = "DÉBITO / CONTADO";
        spanMetodo.className = "metodo-pago-box pago-debito";
    }

    // 4. Cargar Productos
    const productos = JSON.parse(localStorage.getItem("ultimaVenta")) || [];
    const tbody = document.getElementById('cuerpoFactura');
    let totalGeneral = 0;

    productos.forEach(p => {
        const sub = p.cantidadFactura * p.precio;
        totalGeneral += sub;
        tbody.innerHTML += `<tr>
                    <td>${p.cantidadFactura}</td>
                    <td>${p.codigo}</td>
                    <td>${p.nombre}</td>
                    <td>$${parseFloat(p.precio).toFixed(2)}</td>
                    <td>$${sub.toFixed(2)}</td>
                </tr>`;
    });
    document.getElementById('facTotal').innerText = totalGeneral.toFixed(2);
};

function nuevaVenta() {
    localStorage.removeItem("ultimaVenta");
    localStorage.removeItem("metodoPagoSeleccionado");
    window.location.href = "../caja/principal.html";
}