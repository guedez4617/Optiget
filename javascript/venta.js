        let carrito = [];

        function buscarProducto() {
            const busqueda = document.getElementById("buscar").value.toLowerCase();
            const productosAlmacen = JSON.parse(localStorage.getItem("productosVenta")) || [];
            const tablaBusqueda = document.getElementById("tablaBusqueda");
            tablaBusqueda.innerHTML = "";
            if (busqueda.length < 1) return;

            productosAlmacen.filter(p => p.nombre.toLowerCase().includes(busqueda) || p.codigo.toString().includes(busqueda))
                .forEach(p => {
                    tablaBusqueda.innerHTML += `<tr>
                    <td>${p.codigo}</td><td>${p.nombre}</td><td>$${parseFloat(p.precio).toFixed(2)}</td><td>${p.cantidad}</td>
                    <td><button class="icono-agregar" onclick="abrirSelectorCantidad('${p.codigo}')">➕</button></td>
                </tr>`;
                });
        }

        function abrirSelectorCantidad(codigo) {
            const productosAlmacen = JSON.parse(localStorage.getItem("productosVenta")) || [];
            const producto = productosAlmacen.find(p => p.codigo == codigo);
            if (producto) {
                let cant = prompt(`Cantidad para ${producto.nombre}:`, "1");
                if (cant > 0) {
                    if (parseInt(cant) > producto.cantidad) return alert("Stock insuficiente");
                    agregarAlCarrito(producto, parseInt(cant));
                }
            }
        }

        function agregarAlCarrito(producto, cantidad) {
            const existe = carrito.find(item => item.codigo == producto.codigo);
            if (existe) existe.cantidadFactura += cantidad;
            else carrito.push({...producto,
                cantidadFactura: cantidad
            });
            actualizarTablaFactura();
            document.getElementById("tablaBusqueda").innerHTML = "";
            document.getElementById("buscar").value = "";
        }

        function actualizarTablaFactura() {
            const tbody = document.getElementById("tablaFactura");
            let total = 0;
            tbody.innerHTML = "";
            carrito.forEach((p, i) => {
                const sub = p.cantidadFactura * p.precio;
                total += sub;
                tbody.innerHTML += `<tr>
                    <td>${p.codigo}</td><td>${p.nombre}</td><td>${p.cantidadFactura}</td>
                    <td>$${p.precio}</td><td>$${sub.toFixed(2)}</td>
                    <td><button onclick="carrito.splice(${i},1); actualizarTablaFactura()">🗑️</button></td>
                </tr>`;
            });
            document.getElementById("montoTotal").innerText = total.toFixed(2);
        }

        // LÓGICA DEL MODAL
        const modal = document.getElementById("miModal");
        document.getElementById("abrirModal").onclick = () => {
            if (carrito.length > 0) modal.style.display = "flex";
            else alert("Agregue productos primero");
        };

        function procesarPago(tipo) {
            // Guardamos los productos para la factura
            localStorage.setItem("ultimaVenta", JSON.stringify(carrito));

            // Guardamos el método seleccionado (debito o credito)
            localStorage.setItem("metodoPagoSeleccionado", tipo);

            // AHORA AMBOS MANDAN A LA FACTURA DIRECTAMENTE
            window.location.href = '/pantallas/Cajera/factra/fa.html';
        }

        window.onclick = (e) => {
            if (e.target === modal) modal.style.display = "none";
        };