// Datos de estudiantes (simulados para la funcionalidad)
const estudiantes = [
  { id: 1, apellido: "Alvarez Cuili", nombre: "Fernando", deuda: 0 },
  { id: 2, apellido: "Apaza Paco", nombre: "Marck", deuda: 0 },
  { id: 3, apellido: "Bustillos Castillos", nombre: "Martha", deuda: 0 },
  { id: 4, apellido: "Calle Mamani", nombre: "Maria", deuda: 0 },
  { id: 5, apellido: "Chambi Mayta", nombre: "Tania", deuda: 0 },
  { id: 6, apellido: "Condori Apaza", nombre: "Elias", deuda: 0 },
  { id: 7, apellido: "Duchen Machaca", nombre: "Jhordan", deuda: 0 },
  { id: 8, apellido: "Colque Gomez", nombre: "Rodrigo", deuda: 32 },
  { id: 9, apellido: "Guarachi Condori", nombre: "Romel", deuda: 0 },
  { id: 10, apellido: "Gutierrez Quispe", nombre: "Melanie", deuda: 3 },
  { id: 11, apellido: "Huiza Viscarra", nombre: "Luis", deuda: 38 },
  { id: 12, apellido: "Ignacio Pérez", nombre: "Jordan", deuda: 0 },
  { id: 13, apellido: "Lara Delgado", nombre: "Nayeli", deuda: 0 },
  { id: 14, apellido: "Loayza Condori", nombre: "Joseph", deuda: 2 },
  { id: 15, apellido: "Mamani Condori", nombre: "Jhon", deuda: 0 },
  { id: 16, apellido: "Mamani Poma", nombre: "Olivar", deuda: 7 },
  { id: 17, apellido: "Mayta Torrez", nombre: "Mijail", deuda: 1 },
  { id: 18, apellido: "Nina Calle", nombre: "Anahi Nayeli", deuda: 0 },
  { id: 19, apellido: "Nina Quispe", nombre: "Beymar", deuda: 0 },
  { id: 20, apellido: "Ondarza Mamani", nombre: "Brayan", deuda: 0 },
  { id: 21, apellido: "Siñani Marica", nombre: "Emanuel", deuda: 0 },
  { id: 22, apellido: "Ticona Mamani", nombre: "W. Ronad", deuda: 0 },
];

// Función para inicializar la aplicación
// Añadir esta función para manejar la navegación del navbar
function configurarNavegacion() {
  // Obtener todos los enlaces del navbar
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  // Añadir evento click a cada enlace
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Prevenir comportamiento predeterminado
      e.preventDefault();
      
      // Remover clase active de todos los enlaces
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Añadir clase active al enlace clickeado
      this.classList.add('active');
      
      // Obtener el id de la sección a mostrar
      const targetId = this.getAttribute('href');
      
      // Hacer scroll suave a la sección
      document.querySelector(targetId).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
}

// Añadir esta función a la inicialización
document.addEventListener("DOMContentLoaded", function () {
  // Cargar scripts necesarios
  cargarScripts();

  // Inicializar la tabla con datos
  actualizarTablaEstudiantes();
  
  // Mostrar estudiantes con deudas en la sección lateral
  mostrarEstudiantesConDeudas();

  // Configurar el buscador con autocompletado
  configurarBuscador();

  // Configurar el acceso a catedráticos
  configurarAccesoCatedraticos();

  // Configurar botón para generar PDF
  agregarBotonPDF();
  
  // Configurar interfaz según sesión
  configurarInterfazSegunSesion();
  
  // Configurar botón de logout
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", cerrarSesion);
  }
  
  // Configurar botones de pago con Yape
  configurarBotonesPagoYape();
  
  // Configurar navegación del navbar
  configurarNavegacion();
});

// Función para cargar scripts necesarios
function cargarScripts() {
  // Cargar jsPDF
  const jspdfScript = document.createElement("script");
  jspdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  document.body.appendChild(jspdfScript);

  // Cargar html2canvas
  const html2canvasScript = document.createElement("script");
  html2canvasScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  document.body.appendChild(html2canvasScript);
  
  // Cargar script de Yape
  const yapeScript = document.createElement("script");
  yapeScript.src = "js/yape.js";
  document.body.appendChild(yapeScript);
  
  // Cargar script de Supabase
  const supabaseScript = document.createElement("script");
  supabaseScript.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  document.body.appendChild(supabaseScript);
  
  // Cargar configuración de Supabase
  const supabaseConfigScript = document.createElement("script");
  supabaseConfigScript.src = "js/supabase-config.js";
  document.body.appendChild(supabaseConfigScript);
}

// Función para actualizar la tabla de estudiantes
function actualizarTablaEstudiantes(estudiantesFiltrados = null) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  const listaEstudiantes = estudiantesFiltrados || estudiantes;

  listaEstudiantes.forEach((estudiante) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${estudiante.id}</td>
            <td>${estudiante.apellido}</td>
            <td>${estudiante.nombre}</td>
            <td>${estudiante.deuda}</td>
        `;

    // Añadir evento click para mostrar modal si tiene deuda
    tr.addEventListener("click", () => mostrarDetallesEstudiante(estudiante));

    tbody.appendChild(tr);
  });
}

// Función para configurar el buscador con autocompletado
function configurarBuscador() {
  const searchInput = document.querySelector('input[type="search"]');
  const searchButton = document.querySelector('button[type="submit"]');

  // Crear contenedor para sugerencias de autocompletado
  const autocompleteContainer = document.createElement("div");
  autocompleteContainer.className = "autocomplete-items";
  autocompleteContainer.style.position = "absolute";
  autocompleteContainer.style.zIndex = "99";
  autocompleteContainer.style.width = searchInput.offsetWidth + "px";
  autocompleteContainer.style.maxHeight = "200px";
  autocompleteContainer.style.overflowY = "auto";
  autocompleteContainer.style.display = "none";
  autocompleteContainer.style.backgroundColor = "#fff";
  autocompleteContainer.style.border = "1px solid #ddd";
  autocompleteContainer.style.borderTop = "none";

  searchInput.parentNode.appendChild(autocompleteContainer);
  searchInput.parentNode.style.position = "relative";

  // Evento para mostrar sugerencias al escribir
  searchInput.addEventListener("input", function () {
    const valor = this.value.toLowerCase();
    autocompleteContainer.innerHTML = "";
    autocompleteContainer.style.display = "none";

    if (valor.length < 2) return;

    const coincidencias = estudiantes.filter(
      (est) =>
        est.nombre.toLowerCase().includes(valor) ||
        est.apellido.toLowerCase().includes(valor)
    );

    if (coincidencias.length > 0) {
      autocompleteContainer.style.display = "block";

      coincidencias.forEach((est) => {
        const item = document.createElement("div");
        item.style.padding = "10px";
        item.style.cursor = "pointer";
        item.style.borderBottom = "1px solid #ddd";
        item.innerHTML = `<strong>${est.nombre} ${est.apellido}</strong>`;

        item.addEventListener("click", function () {
          searchInput.value = `${est.nombre} ${est.apellido}`;
          autocompleteContainer.style.display = "none";
          mostrarDetallesEstudiante(est);
        });

        item.addEventListener("mouseover", function () {
          this.style.backgroundColor = "#e9e9e9";
        });

        item.addEventListener("mouseout", function () {
          this.style.backgroundColor = "#fff";
        });

        autocompleteContainer.appendChild(item);
      });
    }
  });

  // Ocultar sugerencias al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (e.target !== searchInput) {
      autocompleteContainer.style.display = "none";
    }
  });

  // Configurar búsqueda al hacer clic en el botón
  searchButton.addEventListener("click", function (e) {
    e.preventDefault();
    const valor = searchInput.value.toLowerCase();

    if (valor.trim() === "") {
      actualizarTablaEstudiantes();
      return;
    }

    const resultados = estudiantes.filter(
      (est) =>
        est.nombre.toLowerCase().includes(valor) ||
        est.apellido.toLowerCase().includes(valor)
    );

    actualizarTablaEstudiantes(resultados);
  });
}

// Función para mostrar detalles del estudiante en un modal
function mostrarDetallesEstudiante(estudiante) {
  // Solo mostrar modal si tiene deuda
  if (estudiante.deuda > 0) {
    // Crear el modal
    const modalHTML = `
      <div class="modal fade" id="detalleEstudianteModal" tabindex="-1" aria-labelledby="detalleEstudianteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header ${estudiante.deuda > 10 ? 'bg-danger' : 'bg-warning'} text-white">
              <h5 class="modal-title" id="detalleEstudianteModalLabel">Detalles de Deuda</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="text-center mb-3">
                <i class="bi ${estudiante.deuda > 10 ? 'bi-exclamation-triangle' : 'bi-exclamation-circle'} fs-1 ${estudiante.deuda > 10 ? 'text-danger' : 'text-warning'}"></i>
              </div>
              <h4 class="text-center mb-4">${estudiante.apellido}, ${estudiante.nombre}</h4>
              <div class="row mb-3">
                <div class="col-6 text-end fw-bold">ID:</div>
                <div class="col-6">${estudiante.id}</div>
              </div>
              <div class="row mb-3">
                <div class="col-6 text-end fw-bold">Deuda:</div>
                <div class="col-6 fw-bold ${estudiante.deuda > 10 ? 'text-danger' : 'text-warning'}">${estudiante.deuda} Bs.</div>
              </div>
              <div class="row mb-3">
                <div class="col-6 text-end fw-bold">Estado:</div>
                <div class="col-6">
                  <span class="badge ${estudiante.deuda > 10 ? 'bg-danger' : 'bg-warning'}">Pendiente</span>
                </div>
              </div>
              <div class="alert alert-secondary mt-3">
                <p class="mb-0 small">Para regularizar su situación, debe realizar el pago correspondiente.</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
              <button type="button" class="btn btn-success btn-pagar-yape" data-id="${estudiante.id}">Pagar con Yape</button>
              <button type="button" class="btn btn-primary btn-reclamar" data-id="${estudiante.id}">Reclamar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Añadir el modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('detalleEstudianteModal'));
    modal.show();
    
    // Configurar botón de pago con Yape
    document.querySelector('.btn-pagar-yape').addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const est = estudiantes.find(e => e.id == id);
      if (est) {
        modal.hide();
        mostrarModalPagoYape(est);
      }
    });
    
    // Configurar botón de reclamar
    document.querySelector('.btn-reclamar').addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const est = estudiantes.find(e => e.id == id);
      if (est) {
        enviarReclamo(est);
      }
    });

    // Eliminar el modal del DOM cuando se cierre
    document.getElementById('detalleEstudianteModal').addEventListener('hidden.bs.modal', function () {
      this.remove();
    });
  }
}

// Función para configurar botones de pago con Yape
function configurarBotonesPagoYape() {
  document.querySelectorAll('.btn-pagar-yape').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const estudiante = estudiantes.find(est => est.id == id);
      if (estudiante) {
        mostrarModalPagoYape(estudiante);
      }
    });
  });
}

// Función para enviar reclamo por WhatsApp
function enviarReclamo(estudiante) {
  const mensaje = `Reclamo sobre multa: Estudiante ${estudiante.nombre} ${estudiante.apellido}, ID: ${estudiante.id}, Monto: ${estudiante.deuda} Bs.`;
  const numeroWhatsApp = "+59170123456"; // Número de WhatsApp boliviano
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
  
  window.open(urlWhatsApp, '_blank');
}

// Función para mostrar estudiantes con deudas en la sección lateral
function mostrarEstudiantesConDeudas() {
  const listaDeudores = document.getElementById("lista-deudores");
  if (!listaDeudores) return;

  listaDeudores.innerHTML = "";

  // Filtrar estudiantes con deudas
  const deudores = estudiantes.filter((est) => est.deuda > 0);

  if (deudores.length === 0) {
    listaDeudores.innerHTML =
      '<p class="text-center text-muted">No hay estudiantes con deudas pendientes</p>';
    return;
  }

  // Ordenar por cantidad de deuda (mayor a menor)
  deudores.sort((a, b) => b.deuda - a.deuda);

  // Crear elementos para cada deudor
  deudores.forEach((deudor) => {
    const deudorElement = document.createElement("div");
    deudorElement.className = "estudiante-deudor";
    deudorElement.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${deudor.apellido}, ${deudor.nombre}</strong>
          <div>ID: ${deudor.id}</div>
        </div>
        <div class="text-danger fw-bold">
          ${deudor.deuda} Bs.
        </div>
      </div>
    `;

    // Añadir evento click para mostrar detalles
    deudorElement.addEventListener("click", () =>
      mostrarDetallesEstudiante(deudor)
    );

    listaDeudores.appendChild(deudorElement);
  });
}

// Función para configurar la interfaz según la sesión
function configurarInterfazSegunSesion() {
  const userSession = localStorage.getItem("userSession");
  const adminSession = localStorage.getItem("adminSession");
  
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");
  const btnAdmin = document.getElementById("btnAdmin");
  const userInfo = document.getElementById("userInfo");
  
  if (userSession) {
    // Hay una sesión de usuario normal
    const userData = JSON.parse(userSession);
    
    if (btnLogin) btnLogin.classList.add("d-none");
    if (btnLogout) btnLogout.classList.remove("d-none");
    if (btnAdmin) btnAdmin.classList.add("d-none");
    if (userInfo) userInfo.innerHTML = `<i class="bi bi-person-circle"></i> ${userData.nombre}`;
  } else if (adminSession) {
    // Hay una sesión de administrador
    const adminData = JSON.parse(adminSession);
    
    if (btnLogin) btnLogin.classList.add("d-none");
    if (btnLogout) btnLogout.classList.remove("d-none");
    if (btnAdmin) btnAdmin.classList.remove("d-none");
    if (userInfo) userInfo.innerHTML = `<i class="bi bi-shield-lock"></i> ${adminData.nombre}`;
  } else {
    // No hay sesión activa, redirigir a login
    window.location.href = "login.html";
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("userSession");
  localStorage.removeItem("adminSession");
  localStorage.removeItem("guestSession"); // Por si acaso queda alguna sesión antigua
  window.location.href = "login.html";
}
