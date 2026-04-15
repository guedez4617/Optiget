// ajustes.js

document.addEventListener("DOMContentLoaded", async() => {
    // --- 1. CARGA DE PERFIL DESDE LOCALSTORAGE ---
    const usuarioRaw = localStorage.getItem("usuario");
    if (usuarioRaw) {
        const u = JSON.parse(usuarioRaw);
        document.getElementById('perNombre').value = u.NOMBRE || "";
        document.getElementById('perApellido').value = u.APELLIDO || "";
        document.getElementById('perCedula').value = u.CI || "";
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

    // --- 2. MÁSCARAS Y RESTRICCIONES EN TIEMPO REAL ---
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

    // --- 3. PRECARGA DE NEGOCIO ---
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

// --- FUNCIONES DE VALIDACIÓN ---

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
    if (pass === "") return true; // Si está vacío no se actualiza la clave

    // Regex: Mínimo 8 caracteres, al menos una letra, un número y un carácter especial
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!regex.test(pass)) {
        alert("❌ La contraseña debe tener al menos 8 caracteres, incluir letras, números y un carácter especial (@$!%*#?&)");
        return false;
    }
    return true;
}

// --- 4. EVENTO: GUARDAR PERFIL ---
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

// --- 5. EVENTO: GUARDAR NEGOCIO ---
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