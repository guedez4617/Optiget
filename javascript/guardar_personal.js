        const edicionInfo = JSON.parse(localStorage.getItem('usuarioAEditar'));
        const titulo = document.getElementById('tituloPantalla');
        const boton = document.getElementById('btnAccion');

        // MODO EDICIÓN: Si hay datos guardados, rellenamos
        if (edicionInfo) {
            titulo.innerText = "Editar Usuario";
            boton.innerText = "Guardar Cambios";
            boton.style.backgroundColor = "#c54b00";

            const d = edicionInfo.datos;
            document.getElementById('usuario').value = d.usuario;
            document.getElementById('cedula').value = d.cedula;
            document.getElementById('telefono').value = d.telefono;
            document.getElementById('clave').value = d.clave;
            document.getElementById('rango').value = d.rango;
        }

        document.getElementById('formUsuario').addEventListener('submit', function(e) {
            e.preventDefault();
            let usuarios = JSON.parse(localStorage.getItem('usuariosSistema')) || [];

            const nuevoDato = {
                usuario: document.getElementById('usuario').value.trim(),
                cedula: document.getElementById('cedula').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                clave: document.getElementById('clave').value,
                rango: document.getElementById('rango').value
            };

            if (edicionInfo) {
                // Sobrescribir en la posición original
                usuarios[edicionInfo.index] = nuevoDato;
                localStorage.removeItem('usuarioAEditar');
                alert("Usuario actualizado");
            } else {
                // Verificar que no se repita cédula
                if (usuarios.find(u => u.cedula === nuevoDato.cedula)) {
                    return alert("Esta cédula ya existe");
                }
                usuarios.push(nuevoDato);
                alert("Usuario registrado");
            }

            localStorage.setItem('usuariosSistema', JSON.stringify(usuarios));
            window.location.href = "../personal/per.html";
        });