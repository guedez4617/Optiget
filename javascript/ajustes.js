document.addEventListener("DOMContentLoaded", async() => {
    const usuarioRaw = localStorage.getItem("usuario");
    if (usuarioRaw) {
        const u = JSON.parse(usuarioRaw);
        document.getElementById('perNombre').value = u.NOMBRE || "";
        document.getElementById('perApellido').value = u.APELLIDO || "";
        document.getElementById('perCedula').value = u.CI || u['C.I'] || "";
        document.getElementById('perUsuario').value = u.N_USUARIO || "";
        document.getElementById('perTelefono').value = u.telefono || "";
        document.getElementById('perRango').value = u.nombre_rol || "";

        const passInput = document.getElementById('perPass');
        if (passInput) {
            passInput.value = "";
            passInput.setAttribute('readonly', true);
            setTimeout(() => {
                passInput.removeAttribute('readonly');
                passInput.value = "";
            }, 600);
        }
    }

    const inputRif = document.getElementById('busRif');
    const telPerfil = document.getElementById('perTelefono');
    const telNegocio = document.getElementById('busTel');

    inputRif.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase();
        if (!value.startsWith("J-")) value = "J-";
        const numPart = value.substring(2).replace(/\D/g, "");
        e.target.value = "J-" + numPart;
    });

    [telPerfil, telNegocio].forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, "").substring(0, 11);
        });
    });

    const cargarNegocio = async() => {
        try {
            const res = await fetch('../../php/gestion_negocio.php');
            const data = await res.json();
            if (data && !data.error) {
                document.getElementById('busNombre').value = data.nombre || "";
                const rifBD = data.rif || "";
                document.getElementById('busRif').value = rifBD.startsWith("J-") ? rifBD : "J-" + rifBD;
                document.getElementById('busDir').value = data.direccion || "";
                document.getElementById('busTel').value = data.telefono || "";
            }
        } catch (e) { console.error(e); }
    };
    cargarNegocio();
});


function validarTelefono(telefono) {
    if (!telefono.startsWith("04")) {
        alert("❌ El teléfono debe comenzar con 04");
        return false;
    }
    if (telefono.length !== 11 || telefono === "04000000000") {
        alert("❌ El número de teléfono no es válido");
        return false;
    }
    return true;
}

function validarPassword(pass) {
    if (pass === "") return true;

    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!regex.test(pass)) {
        alert("❌ La contraseña debe tener al menos 8 caracteres, incluir letras, números y un carácter especial (@$!%*#?&)");
        return false;
    }
    return true;
}

document.getElementById('formPerfil').addEventListener('submit', async(e) => {
    e.preventDefault();
    const tel = document.getElementById('perTelefono').value.trim();
    const pass = document.getElementById('perPass').value.trim();

    if (!validarTelefono(tel)) return;
    if (!validarPassword(pass)) return;

    const datosUpdate = {
        cedula: document.getElementById('perCedula').value,
        telefono: tel,
        password: pass
    };

    try {
        const res = await fetch('../../php/actualizar_perfil.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUpdate)
        });
        const data = await res.json();
        if (data.status === "success") {
            alert("✅ Perfil actualizado correctamente");
            const u = JSON.parse(localStorage.getItem("usuario"));
            u.telefono = tel;
            localStorage.setItem("usuario", JSON.stringify(u));
            document.getElementById('perPass').value = "";
        }
    } catch (err) { alert("Error de conexión"); }
});

const btnNegocio = document.querySelector('#seccion-negocio .btn-azul');
if (btnNegocio) {
    btnNegocio.addEventListener('click', async(e) => {
        e.preventDefault();
        const tel = document.getElementById('busTel').value.trim();
        let rifRaw = document.getElementById('busRif').value.trim();

        if (!validarTelefono(tel)) return;

        let soloNumeros = rifRaw.replace("J-", "").replace(/-/g, "");
        if (soloNumeros.length < 5) {
            alert("❌ RIF inválido");
            return;
        }

        let corpo = soloNumeros.slice(0, -1);
        let verificador = soloNumeros.slice(-1);
        let rifFinal = `J-${corpo}-${verificador}`;

        const u = JSON.parse(localStorage.getItem("usuario"));
        const info = {
            nombre: document.getElementById('busNombre').value.trim(),
            rif: rifFinal,
            direccion: document.getElementById('busDir').value.trim(),
            telefono: tel,
            id_usuario_cambio: u.CI
        };

        try {
            const res = await fetch('../../php/gestion_negocio.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(info)
            });
            const resultado = await res.json();
            if (resultado.status === "success") {
                alert(`✅ Datos guardados. RIF: ${rifFinal}`);
                document.getElementById('busRif').value = rifFinal;
            }
        } catch (error) { alert("Error al guardar"); }
    });
}

const colorInput = document.getElementById('colorSistema');
const hexValor = document.getElementById('hexValor');

if (colorInput && hexValor) {
    colorInput.addEventListener('input', (e) => {
        hexValor.textContent = e.target.value;
    });
}

const cargarApariencia = async() => {
    try {
        const res = await fetch('../../php/obtener_apariencia.php');
        const data = await res.json();
        if (colorInput && hexValor) {
            colorInput.value = data.color_tema || '#c54b00';
            hexValor.textContent = data.color_tema || '#c54b00';
        }
    } catch (e) { console.error('Error al cargar apariencia', e); }
};
cargarApariencia();

document.getElementById('formDiseno')?.addEventListener('submit', async(e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('color_tema', document.getElementById('colorSistema').value);

    const inputFondo = document.getElementById('inputFondo');
    if (inputFondo.files.length > 0) {
        formData.append('fondo_sistema', inputFondo.files[0]);
    }

    const inputLogo = document.getElementById('inputLogo');
    if (inputLogo.files.length > 0) {
        formData.append('logo_sistema', inputLogo.files[0]);
    }

    try {
        const res = await fetch('../../php/guardar_apariencia.php', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.status === 'ok') {
            alert('✅ Apariencia actualizada correctamente.\nLos cambios se reflejarán instantáneamente.');

            const root = document.documentElement;
            root.style.setProperty('--color-tema', data.color_tema);
            if (inputFondo.files.length > 0) {
                const ts = new Date().getTime();
                const scripts = document.getElementsByTagName('script');
                let baseUrl = '/';
                for (let s of scripts) {
                    if (s.src && s.src.includes('ajustes.js')) {
                        baseUrl = s.src.split('javascript/ajustes.js')[0];
                        break;
                    }
                }
                root.style.setProperty('--fondo-sistema', `url('${baseUrl}imagenes/${data.fondo_sistema}?v=${ts}')`);
            }

            inputFondo.value = '';
            inputLogo.value = '';
        } else {
            alert('❌ Error: ' + data.mensaje);
        }
    } catch (err) {
        alert("Error de conexión al guardar diseño");
    }
});