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
document.addEventListener("DOMContentLoaded", function () {
  // Cargar scripts necesarios para PDF
  cargarScriptsPDF();

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
});

// Función para cargar scripts necesarios para PDF
function cargarScriptsPDF() {
  // Cargar jsPDF
  const jspdfScript = document.createElement("script");
  jspdfScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  document.body.appendChild(jspdfScript);

  // Cargar html2canvas
  const html2canvasScript = document.createElement("script");
  html2canvasScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  document.body.appendChild(html2canvasScript);
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
  // Eliminar modal anterior si existe
  const modalAnterior = document.getElementById("detalleEstudianteModal");
  if (modalAnterior) {
    modalAnterior.remove();
  }

  // Crear modal
  const modal = document.createElement("div");
  modal.id = "detalleEstudianteModal";
  modal.className = "modal fade";
  modal.setAttribute("tabindex", "-1");
  modal.setAttribute("aria-labelledby", "detalleEstudianteModalLabel");
  modal.setAttribute("aria-hidden", "true");

  // Contenido del modal
  modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header ${
                  estudiante.deuda > 0
                    ? "bg-danger text-white"
                    : "bg-success text-white"
                }">
                    <h5 class="modal-title" id="detalleEstudianteModalLabel">Detalles del Estudiante</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${estudiante.nombre} ${
    estudiante.apellido
  }</h5>
                            <p class="card-text"><strong>ID:</strong> ${
                              estudiante.id
                            }</p>
                            <p class="card-text"><strong>Estado:</strong> 
                                ${
                                  estudiante.deuda > 0
                                    ? `<span class="text-danger fw-bold">Debe ${estudiante.deuda} Bs.</span>`
                                    : '<span class="text-success fw-bold">No debe nada</span>'
                                }
                            </p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    ${
                      estudiante.deuda > 0
                        ? `
                    <a href="https://wa.me/59160637274?text=Hola,%20soy%20${encodeURIComponent(
                      estudiante.nombre + " " + estudiante.apellido
                    )}%20(ID:%20${
                            estudiante.id
                          }).%20Quiero%20reclamar%20sobre%20mi%20deuda%20de%20${
                            estudiante.deuda
                          }%20Bs." class="btn btn-reclamar" target="_blank">
                        <i class="bi bi-whatsapp"></i> Reclamar
                    </a>
                    `
                        : ""
                    }
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Mostrar el modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}

// Función para configurar acceso a catedráticos
function configurarAccesoCatedraticos() {
  const enlaceCatedraticos = document.querySelector(".nav-link:not(.active)");

  enlaceCatedraticos.addEventListener("click", function (e) {
    e.preventDefault();

    // Crear modal de acceso restringido
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "accesoCatedraticosModal";
    modal.setAttribute("tabindex", "-1");
    modal.setAttribute("aria-labelledby", "accesoCatedraticosModalLabel");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-warning">
                        <h5 class="modal-title" id="accesoCatedraticosModalLabel">Acceso Restringido</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-3">
                            <i class="bi bi-shield-lock" style="font-size: 3rem; color: #ffc107;"></i>
                        </div>
                        <p class="text-center fw-bold">Necesitas permiso de administrador para acceder a esta sección.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Mostrar el modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // Eliminar el modal del DOM después de cerrarlo
    modal.addEventListener("hidden.bs.modal", function () {
      modal.remove();
    });
  });
}

// Función para agregar botón de generar PDF
function agregarBotonPDF() {
  // Crear botón para generar PDF
  const botonPDF = document.createElement("button");
  botonPDF.className = "btn btn-primary ms-2";
  botonPDF.innerHTML = '<i class="bi bi-file-pdf"></i> Generar PDF';

  // Añadir el botón al encabezado de la tarjeta
  const cardHeader = document.querySelector(".card-header");
  cardHeader.style.display = "flex";
  cardHeader.style.justifyContent = "space-between";
  cardHeader.style.alignItems = "center";

  // Crear contenedor para el título
  const tituloContainer = document.createElement("div");
  tituloContainer.innerHTML = cardHeader.innerHTML;
  cardHeader.innerHTML = "";

  cardHeader.appendChild(tituloContainer);
  cardHeader.appendChild(botonPDF);

  // Añadir evento para generar PDF
  botonPDF.addEventListener("click", generarPDF);
}

// Función para generar PDF
function generarPDF() {
  // Verificar si las bibliotecas están cargadas
  if (typeof html2canvas === "undefined" || typeof jspdf === "undefined") {
    alert(
      "Cargando las bibliotecas necesarias. Por favor, intente nuevamente en unos segundos."
    );
    return;
  }

  // Mostrar mensaje de generación
  const loadingMessage = document.createElement("div");
  loadingMessage.style.position = "fixed";
  loadingMessage.style.top = "0";
  loadingMessage.style.left = "0";
  loadingMessage.style.width = "100%";
  loadingMessage.style.height = "100%";
  loadingMessage.style.backgroundColor = "rgba(0,0,0,0.5)";
  loadingMessage.style.display = "flex";
  loadingMessage.style.justifyContent = "center";
  loadingMessage.style.alignItems = "center";
  loadingMessage.style.zIndex = "9999";
  loadingMessage.innerHTML = `
    <div class="card p-4 shadow-lg" style="max-width: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <h5>Generando PDF...</h5>
        <p class="text-muted">Por favor espere un momento</p>
      </div>
    </div>
  `;
  document.body.appendChild(loadingMessage);

  // Obtener la tabla
  const tabla = document.querySelector(".table");

  // Crear un contenedor para el PDF
  const pdfContainer = document.createElement("div");
  pdfContainer.style.position = "absolute";
  pdfContainer.style.left = "-9999px";
  pdfContainer.style.width = "800px";

  // Crear el contenido del PDF
  const fecha = new Date().toLocaleDateString("es-BO");
  pdfContainer.innerHTML = `
    <div style="padding: 50px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 5px;">
        <h1 style="color:rgb(0, 0, 0); margin-bottom: 5px;">MULTAS DE I.T.F.</h1>
        <p style="color:rgb(132, 135, 139); font-size: 14px;">Fecha: ${fecha}</p>
      </div>
      
      <h2 style=" text-align: center; color:rgb(245, 0, 0);font-size: 16px; margin-bottom: 5px;font-weight: bold;">LISTADO DE ESTUDIANTES CON SU DEUDA</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
        <thead>
          <tr style="background-color:rgb(71, 71, 71); color: white;">
            <th style="padding: 12px; text-align: center; border: 1px solid rgb(172, 172, 172);">ID</th>
            <th style="padding: 12px; text-align: center; border: 1px solid rgb(172, 172, 172);">Apellido</th>
            <th style="padding: 12px; text-align: center; border: 1px solid rgb(172, 172, 172);">Nombre</th>
            <th style="padding: 12px; text-align: center; border: 1px solid rgb(172, 172, 172);">Deuda (Bs.)</th>
          </tr>
        </thead>
        <tbody>
          ${estudiantes
            .map(
              (est) => `
            <tr style="${
              est.deuda > 0 ? "background-color:rgb(254, 172, 179);" : ""
            }">
              <td style="padding: 5px; text-align: center; border: 1px solid rgb(172, 172, 172);">${
                est.id
              }</td>
              <td style="padding: 5px; text-align: left; border: 1px solid rgb(172, 172, 172);">${
                est.apellido
              }</td>
              <td style="padding: 5px; text-align: left; border: 1px solid rgb(172, 172, 172);">${
                est.nombre
              }</td>
              <td style="padding: 5px; text-align: center; border: 1px solid rgb(172, 172, 172); ${
                est.deuda > 0 ? "color:rgb(0, 0, 0); font-weight: bold;" : ""
              }">${est.deuda}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      <div style="margin-top: 2px; font-size: 10px; color: #6c757d; text-align: center;">
        <p>Este documento es un reporte oficial de multas de I.T.F.</p>
        <p>Para cualquier reclamo, contactar al ...</p>
      </div>
    </div>
  `;

  document.body.appendChild(pdfContainer);

  // Usar html2canvas para convertir el contenido a imagen
  html2canvas(pdfContainer).then((canvas) => {
    // Crear PDF
    const pdf = new jspdf.jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Añadir la imagen al PDF
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Añadir páginas adicionales si es necesario
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Guardar el PDF
    pdf.save(`Multas_ITF_${fecha.replace(/\//g, "-")}.pdf`);

    // Eliminar elementos temporales
    document.body.removeChild(pdfContainer);
    document.body.removeChild(loadingMessage);
  });
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
