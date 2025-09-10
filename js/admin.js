// ============================
// Variables globales
// ============================
let estudiantes = [];

// ============================
// Inicialización de la página
// ============================
document.addEventListener("DOMContentLoaded", async () => {
    await verificarSesionAdmin();
    cargarSweetAlert();

    try {
        console.log('🔄 Cargando Supabase...');
        await loadSupabase();
        console.log('✅ Supabase cargado');

        await new Promise(resolve => setTimeout(resolve, 500));
        await cargarEstudiantesDesdeSupabase();
    } catch (error) {
        console.error('❌ Error inicialización:', error);
        cargarDatosGuardados(); // fallback local
    }

    mostrarNombreAdmin();
    cargarDatosDashboard();
    cargarTablaEstudiantes();
    configurarBotones();
    cargarListaDeudores();
    aplicarFondoGuardado();
});

// ============================
// Funciones Supabase / carga
// ============================
async function cargarEstudiantesDesdeSupabase() {
    try {
        if (!window.EstudiantesDB) throw new Error('EstudiantesDB no disponible');
        const estudiantesDB = await EstudiantesDB.obtenerTodos();
        estudiantes = [...estudiantesDB];
        cargarDashboard();
        console.log('✅ Estudiantes cargados:', estudiantes.length);
    } catch (error) {
        console.error('❌ Error cargando estudiantes:', error);
        if (estudiantes.length === 0) {
            estudiantes.push(
                { id: 1, apellido: "Alvarez Cuili", nombre: "Fernando", deuda: 0 },
                { id: 2, apellido: "Apaza Paco", nombre: "Marck", deuda: 0 },
                { id: 8, apellido: "Colque Gomez", nombre: "Rodrigo", deuda: 32 },
                { id: 10, apellido: "Gutierrez Quispe", nombre: "Melanie", deuda: 3 },
                { id: 11, apellido: "Huiza Viscarra", nombre: "Luis", deuda: 38 }
            );
        }
    }
}

// ============================
// Sesión administrador
// ============================
function verificarSesionAdmin() {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) return (window.location.href = "login.html");

    try {
        const info = JSON.parse(adminSession);
        if (Date.now() - info.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem("adminSession");
            return (window.location.href = "login.html");
        }
        console.log("Sesión admin válida:", info.nombre);
    } catch {
        localStorage.removeItem("adminSession");
        window.location.href = "login.html";
    }
}

function mostrarNombreAdmin() {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) return;
    const { nombre } = JSON.parse(adminSession);
    const adminNameElement = document.getElementById("adminName");
    if (adminNameElement) adminNameElement.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.style.display = "inline-block";
        btnLogout.innerHTML = '<i class="bi bi-box-arrow-right"></i> SALIR';
        btnLogout.addEventListener("click", cerrarSesion);
    }
}

// ============================
// SweetAlert2
// ============================
function cargarSweetAlert() {
    if (!window.Swal) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
        document.body.appendChild(script);
    }
}

// ============================
// Dashboard
// ============================
function cargarDatosDashboard() {
    document.getElementById("totalEstudiantes")?.textContent = estudiantes.length;
    const deudores = estudiantes.filter(e => e.deuda > 0);
    document.getElementById("totalDeudores")?.textContent = deudores.length;
    document.getElementById("totalRecaudado")?.textContent = `${estudiantes.reduce((a, b) => a + b.deuda, 0)} Bs.`;
}

function actualizarDashboard() {
    cargarDatosDashboard();
}

// ============================
// Tabla de estudiantes
// ============================
function cargarTablaEstudiantes() {
    const tbody = document.getElementById("tablaEstudiantesAdmin");
    if (!tbody) return;
    tbody.innerHTML = "";
    estudiantes.forEach(est => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${est.id}</td>
            <td>${est.apellido}</td>
            <td>${est.nombre}</td>
            <td>${est.deuda} Bs.</td>
            <td>
                <button class="btn btn-sm btn-success me-1 btn-aumentar-multa" data-id="${est.id}" title="Aumentar"><i class="bi bi-plus"></i></button>
                <button class="btn btn-sm btn-warning btn-disminuir-multa" data-id="${est.id}" title="Disminuir" ${est.deuda <= 0 ? 'disabled' : ''}><i class="bi bi-dash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarTablaAdmin() {
    cargarTablaEstudiantes();
}

// ============================
// Funciones de deuda
// ============================
function configurarBotones() {
    document.addEventListener("click", async e => {
        const id = parseInt(e.target.closest("button")?.dataset?.id);
        if (e.target.closest(".btn-aumentar-multa")) aumentarMulta(id);
        if (e.target.closest(".btn-disminuir-multa")) disminuirMulta(id);
        if (e.target.closest(".btn-generar-pdf") || e.target.id === 'btnGenerarPDF') generarPDFDeudores();
    });
}

async function aumentarMulta(id) {
    const est = estudiantes.find(e => e.id === id);
    if (!est) return;
    const { value: monto } = await Swal.fire({
        title: `Aumentar multa a ${est.nombre} ${est.apellido}`,
        input: 'number',
        inputLabel: `Deuda actual: ${est.deuda} Bs.`,
        inputValue: 1,
        inputAttributes: { min: 0.5, step: 0.5 },
        showCancelButton: true,
        confirmButtonText: 'Aumentar'
    });
    if (monto && monto > 0) {
        est.deuda += parseFloat(monto);
        await EstudiantesDB?.actualizarDeuda?.(est.id, est.deuda);
        actualizarTablaAdmin();
        actualizarDashboard();
        cargarListaDeudores();
        sincronizarConVistaUsuario();
        Swal.fire('¡Multa aumentada!', `Se agregó ${monto} Bs.`, 'success');
    }
}

async function disminuirMulta(id) {
    const est = estudiantes.find(e => e.id === id);
    if (!est || est.deuda <= 0) return;
    const { value: monto } = await Swal.fire({
        title: `Disminuir multa a ${est.nombre} ${est.apellido}`,
        input: 'number',
        inputLabel: `Deuda actual: ${est.deuda} Bs.`,
        inputValue: 1,
        inputAttributes: { min: 0.5, max: est.deuda, step: 0.5 },
        showCancelButton: true,
        confirmButtonText: 'Disminuir'
    });
    if (monto && monto > 0) {
        est.deuda = Math.max(0, est.deuda - parseFloat(monto));
        await EstudiantesDB?.actualizarDeuda?.(est.id, est.deuda);
        actualizarTablaAdmin();
        actualizarDashboard();
        cargarListaDeudores();
        sincronizarConVistaUsuario();
        Swal.fire('¡Multa disminuida!', `Se redujo ${monto} Bs.`, 'success');
    }
}

// ============================
// Lista de deudores
// ============================
function cargarListaDeudores() {
    const container = document.getElementById('listaDeudoresAdmin');
    if (!container) return;
    const deudores = estudiantes.filter(e => e.deuda > 0);
    container.innerHTML = deudores.length === 0
        ? '<p class="text-muted">No hay estudiantes con deudas pendientes.</p>'
        : deudores.map(e => `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div><strong>${e.apellido}, ${e.nombre}</strong><br><small>ID: ${e.id}</small></div>
                <div class="text-end"><span class="badge bg-danger">${e.deuda} Bs.</span></div>
            </div>
        `).join('');
}

// ============================
// Sincronización y persistencia
// ============================
function sincronizarConVistaUsuario() {
    if (window.parent) window.parent.estudiantes = estudiantes;
    window.dispatchEvent(new CustomEvent('datosActualizados', { detail: { estudiantes } }));
    localStorage.setItem('estudiantesData', JSON.stringify(estudiantes));
}

// ============================
// Fondo
// ============================
function aplicarFondoGuardado() {
    const config = JSON.parse(localStorage.getItem('fondoConfig') || '{}');
    if (config.color) document.body.style.backgroundColor = config.color;
    if (config.imagen) {
        document.body.style.backgroundImage = `url(${config.imagen})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    }
}

// ============================
// PDF
// ============================
function generarPDFDeudores() {
    const deudores = estudiantes.filter(e => e.deuda > 0);
    if (deudores.length === 0) return Swal.fire('Sin deudores', 'No hay estudiantes con deudas', 'info');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('REPORTE DE DEUDORES', 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);

    let y = 50;
    doc.setFontSize(10);
    doc.text('ID', 20, y); doc.text('APELLIDO', 40, y); doc.text('NOMBRE', 100, y); doc.text('DEUDA', 150, y);
    y += 10; doc.line(20, y - 5, 190, y - 5);

    let total = 0;
    deudores.forEach(e => {
        doc.text(e.id.toString(), 20, y);
        doc.text(e.apellido, 40, y);
        doc.text(e.nombre, 100, y);
        doc.text(e.deuda.toString(), 150, y);
        total += e.deuda;
        y += 8;
    });
    y += 10; doc.line(20, y - 5, 190, y - 5);
    doc.setFontSize(12);
    doc.text(`TOTAL DEUDORES: ${deudores.length}`, 20, y);
    doc.text(`TOTAL DEUDA: ${total} Bs.`, 100, y);

    doc.save(`deudores_${new Date().toISOString().split('T')[0]}.pdf`);
    Swal.fire('¡PDF generado!', 'El reporte se ha descargado', 'success');
}

// ============================
// Cerrar sesión
// ============================
function cerrarSesion() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cerrar sesión'
    }).then(result => {
        if (result.isConfirmed) {
            localStorage.removeItem("adminSession");
            localStorage.removeItem("userSession");
            localStorage.removeItem("guestSession");
            Swal.fire({ title: '¡Hasta luego!', icon: 'success', timer: 1500, showConfirmButton: false })
                .then(() => window.location.href = "login.html");
        }
    });
}
