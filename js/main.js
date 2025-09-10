// Datos de estudiantes - se cargarán desde Supabase
let estudiantes = [];

// Función para inicializar la aplicación
// Añadir esta función para manejar la navegación del navbar
function configurarNavegacion() {
  // Obtener todos los enlaces del navbar
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  // Añadir evento click a cada enlace
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Prevenir comportamiento predeterminado
      e.preventDefault();

      // Remover clase active de todos los enlaces
      navLinks.forEach((l) => l.classList.remove("active"));

      // Añadir clase active al enlace clickeado
      this.classList.add("active");

      // Obtener el id de la sección a mostrar
      const targetId = this.getAttribute("href");

      // Hacer scroll suave a la sección
      document.querySelector(targetId).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
}

async function inicializarAplicacion() {
  try {
    // 1️⃣ Cargar Supabase
    await loadSupabase();

    // 2️⃣ Cargar estudiantes
    await cargarEstudiantesDesdeSupabaseMain();

    // 3️⃣ Cargar scripts externos
    cargarScripts();

    // 4️⃣ Configurar interfaz y eventos
    configurarInterfazSegunSesion();
    configurarNavegacion();
    configurarBuscador();
    configurarBotonesPagoYape();

    // 5️⃣ Inicializar tabla y sección de deudores
    actualizarTablaEstudiantes();
    mostrarEstudiantesConDeudas();

    // 6️⃣ Configurar logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) btnLogout.addEventListener("click", cerrarSesion);

  } catch (error) {
    console.error("Error inicializando app:", error);
    cargarDatosGuardados();
  }
}

document.addEventListener("DOMContentLoaded", inicializarAplicacion);

// Configurar intervalos y eventos después de la inicialización
window.addEventListener('load', function () {
  // Forzar verificación de sesión cada segundo
  setInterval(function () {
    const userSession = localStorage.getItem("userSession");
    const adminSession = localStorage.getItem("adminSession");
    const btnLogout = document.getElementById("btnLogout");

    if ((userSession || adminSession) && btnLogout) {
      btnLogout.style.display = "block";
      btnLogout.style.visibility = "visible";
      btnLogout.classList.remove("d-none");
      btnLogout.innerHTML = '<i class="bi bi-box-arrow-right"></i> SALIR';
    }
  }, 1000);

  // Escuchar cambios desde admin
  window.addEventListener('datosActualizados', function (e) {
    estudiantes.length = 0;
    estudiantes.push(...e.detail.estudiantes);
    actualizarTablaEstudiantes();
    mostrarEstudiantesConDeudas();
  });

  // Verificar conexión y datos cada 10 segundos (reducido para evitar problemas)
  setInterval(async function () {
    try {
      if (window.EstudiantesDB && window.supabase && typeof window.supabase.from === 'function') {
        const estudiantesActualizados = await EstudiantesDB.obtenerTodos();
        const hayDiferencias = JSON.stringify(estudiantes) !== JSON.stringify(estudiantesActualizados);
        if (hayDiferencias) {
          estudiantes.length = 0;
          estudiantes.push(...estudiantesActualizados);
          actualizarTablaEstudiantes();
          mostrarEstudiantesConDeudas();
          console.log('Datos sincronizados desde Supabase');
        }
      }
    } catch (error) {
      console.error('Error al sincronizar:', error);
    }
  }, 10000);
});

// Función para cargar Supabase en main
async function cargarSupabaseMain() {
  try {
    await loadSupabase();
    console.log('Supabase cargado en main');

    // Suscribirse a cambios en tiempo real
    EstudiantesDB.suscribirCambios((payload) => {
      console.log('Cambio detectado en tiempo real:', payload);
      // Recargar estudiantes cuando hay cambios
      cargarEstudiantesDesdeSupabaseMain();
    });
  } catch (error) {
    console.error('Error al cargar Supabase en main:', error);
  }
}

// Función para cargar estudiantes desde Supabase en main
async function cargarEstudiantesDesdeSupabaseMain() {
  try {
    console.log('🔄 Cargando estudiantes en main...');

    // Verificar que Supabase esté disponible
    if (!window.supabaseClient) {
      console.error('❌ Supabase no disponible');
      throw new Error('Supabase no disponible');
    }

    if (!window.EstudiantesDB || typeof EstudiantesDB.obtenerTodos !== 'function') {
      console.error('❌ EstudiantesDB no disponible');
      throw new Error('EstudiantesDB no disponible');
    }

    console.log('🔍 Probando conexión directa a Supabase...');

    // Probar conexión directa primero
    const { data: testData, error: testError } = await window.supabaseClient
      .from('estudiantes')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Error de conexión Supabase:', testError);
      throw testError;
    }

    console.log('✅ Conexión Supabase OK, cargando todos los estudiantes...');

    const estudiantesDB = await EstudiantesDB.obtenerTodos();
    console.log('📊 Datos recibidos de Supabase:', estudiantesDB);

    estudiantes.length = 0;
    estudiantes.push(...estudiantesDB);

    // Actualizar interfaz
    if (typeof actualizarTablaEstudiantes === 'function') actualizarTablaEstudiantes();
    if (typeof mostrarEstudiantesConDeudas === 'function') mostrarEstudiantesConDeudas();

    console.log('✅ Estudiantes cargados en main desde Supabase:', estudiantes.length);

    if (estudiantes.length === 0) {
      console.warn('⚠️ No hay estudiantes en la base de datos');
      console.log('💡 Ejecuta este SQL en Supabase:');
      console.log(
        "INSERT INTO estudiantes (apellido, nombre, deuda) VALUES ('Alvarez Cuili', 'Fernando', 0), ('Colque Gomez', 'Rodrigo', 32), ('Nina Quispe', 'Beymar', 0);"
      );

      const tbody = document.querySelector("tbody");
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-warning">⚠️ No hay estudiantes registrados en Supabase<br><small>Ejecuta el SQL de inserción</small></td></tr>';
      }
    } else {
      console.log('🎉 Estudiantes encontrados:', estudiantes.map(e => `${e.apellido}, ${e.nombre}`));
    }
  } catch (error) {
    console.error('❌ Error al cargar estudiantes en main:', error);
    console.log('🔄 Intentando fallback a datos locales...');
    if (typeof cargarDatosGuardados === 'function') cargarDatosGuardados();
  }
}


// Función para cargar datos guardados desde localStorage (fallback)
function cargarDatosGuardados() {
  const datosGuardados = localStorage.getItem('estudiantesData');
  if (datosGuardados) {
    try {
      const estudiantesGuardados = JSON.parse(datosGuardados);
      estudiantes.length = 0;
      estudiantes.push(...estudiantesGuardados);
    } catch (error) {
      console.error('Error al cargar datos guardados:', error);
    }
  }
}

// Función para cargar scripts necesarios
function cargarScripts() {
  console.log('Scripts básicos cargados');

  // Cargar html2canvas
  const html2canvasScript = document.createElement("script");
  html2canvasScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  document.body.appendChild(html2canvasScript);

  // Cargar script de Yape
  const yapeScript = document.createElement("script");
  yapeScript.src = "js/yape.js";
  document.body.appendChild(yapeScript);

  // ⚠️ Ya NO cargamos supabase.js aquí, se hace en index.html una sola vez
  console.log('Supabase ya estaba cargado, no se vuelve a insertar');

  // Cargar SweetAlert2 para las alertas de logout
  const sweetalertScript = document.createElement("script");
  sweetalertScript.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
  document.body.appendChild(sweetalertScript);
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
function mostrarDetallesEstudiante(estudiante) {
  // Solo mostrar modal si tiene deuda
  if (estudiante && estudiante.deuda > 0) {
    // Eliminar modal anterior si existe
    const modalAnterior = document.getElementById('detalleEstudianteModal');
    if (modalAnterior) {
      modalAnterior.remove();
    }

    // Crear el modal
    const modalHTML = `
      <div class="modal fade" id="detalleEstudianteModal" tabindex="-1" aria-labelledby="detalleEstudianteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header ${estudiante.deuda > 10 ? "bg-danger" : "bg-warning"
      } text-white">
              <h5 class="modal-title" id="detalleEstudianteModalLabel">Detalles de Deuda</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="text-center mb-3">
                <i class="bi ${estudiante.deuda > 10
        ? "bi-exclamation-triangle"
        : "bi-exclamation-circle"
      } fs-1 ${estudiante.deuda > 10 ? "text-danger" : "text-warning"
      }"></i>
              </div>
              <h4 class="text-center mb-4">${estudiante.apellido}, ${estudiante.nombre
      }</h4>
              
              <div class="row mb-3">
                <div class="col-6 text-end fw-bold">ID:</div>
                <div class="col-6">${estudiante.id}</div>
              </div>
              <div class="row mb-3">
                <div class="col-6 text-end fw-bold">Deuda:</div>
                <div class="col-6 fw-bold ${estudiante.deuda > 10 ? "text-danger" : "text-warning"
      }">${estudiante.deuda} Bs.</div>
              </div>
              <div class="row mb-3">
                <div class="col-6 text-end fw-bold">Estado:</div>
                <div class="col-6">
                  <span class="badge ${estudiante.deuda > 10 ? "bg-danger" : "bg-warning"
      }">Pendiente</span>
                </div>
              </div>
              <div class="alert alert-info mt-4">
                <i class="bi bi-info-circle"></i>
                <strong>Información:</strong> Para resolver esta deuda, puedes usar el botón de pago con Yape o contactar con la administración.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
              <button type="button" class="btn btn-success btn-pago-yape" data-estudiante-id="${estudiante.id}">
                <i class="bi bi-credit-card"></i> Pagar con Yape
              </button>
              <button type="button" class="btn btn-primary" onclick="enviarReclamo({id: ${estudiante.id}, nombre: '${estudiante.nombre}', apellido: '${estudiante.apellido}', deuda: ${estudiante.deuda}})">
                <i class="bi bi-whatsapp"></i> Enviar Reclamo
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Añadir el modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Mostrar el modal
    const modal = new bootstrap.Modal(
      document.getElementById("detalleEstudianteModal")
    );
    modal.show();

    // Configurar botón de pago con Yape
    document
      .querySelector(".btn-pagar-yape")
      .addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        const est = estudiantes.find((e) => e.id == id);
        if (est) {
          modal.hide();
          mostrarModalPagoYape(est);
        }
      });

    // Configurar botón de reclamar
    document
      .querySelector(".btn-reclamar")
      .addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        const est = estudiantes.find((e) => e.id == id);
        if (est) {
          enviarReclamo(est);
        }
      });

    // Eliminar el modal del DOM cuando se cierre
    document
      .getElementById("detalleEstudianteModal")
      .addEventListener("hidden.bs.modal", function () {
        this.remove();
      });
  }
}

// Función para configurar botones de pago con Yape
function configurarBotonesPagoYape() {
  document.querySelectorAll(".btn-pagar-yape").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const estudiante = estudiantes.find((est) => est.id == id);
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
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
    mensaje
  )}`;

  window.open(urlWhatsApp, "_blank");
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

  console.log("Configurando interfaz - userSession:", userSession);
  console.log("Configurando interfaz - adminSession:", adminSession);

  if (userSession) {
    // Hay una sesión de usuario normal
    const userData = JSON.parse(userSession);

    // Verificar si la sesión es válida (no expirada)
    const sessionAge = new Date().getTime() - userData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    if (sessionAge > maxAge) {
      // Sesión expirada, limpiar y redirigir
      localStorage.removeItem("userSession");
      window.location.href = "test-login.html";
      return;
    }

    // FORZAR la visibilidad del botón de logout
    if (btnLogin) {
      btnLogin.style.display = "none !important";
    }
    if (btnLogout) {
      btnLogout.style.display = "block !important";
      btnLogout.style.visibility = "visible !important";
      btnLogout.classList.remove("d-none");
      btnLogout.innerHTML = '<i class="bi bi-box-arrow-right"></i> SALIR';
    }
    if (btnAdmin) btnAdmin.style.display = "none";
    if (userInfo) {
      userInfo.innerHTML = `<i class="bi bi-person-circle"></i> ${userData.nombre}`;
      userInfo.style.display = "inline-block";
    }

    console.log("Usuario logueado - botón logout FORZADO");
  } else if (adminSession) {
    // Hay una sesión de administrador
    const adminData = JSON.parse(adminSession);

    // Verificar si la sesión es válida (no expirada)
    const sessionAge = new Date().getTime() - adminData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    if (sessionAge > maxAge) {
      // Sesión expirada, limpiar y redirigir
      localStorage.removeItem("adminSession");
      window.location.href = "test-login.html";
      return;
    }

    if (btnLogin) {
      btnLogin.style.display = "none !important";
    }
    if (btnLogout) {
      btnLogout.style.display = "block !important";
      btnLogout.style.visibility = "visible !important";
      btnLogout.classList.remove("d-none");
      btnLogout.innerHTML = '<i class="bi bi-box-arrow-right"></i> SALIR';
    }
    if (btnAdmin) {
      btnAdmin.style.display = "inline-block";
      btnAdmin.classList.remove("d-none");
    }
    if (userInfo) {
      userInfo.innerHTML = `<i class="bi bi-shield-lock"></i> ${adminData.nombre}`;
      userInfo.style.display = "inline-block";
    }

    console.log("Admin logueado - botón logout FORZADO");
  } else {
    // No hay sesión activa, mostrar botón de login
    if (btnLogin) {
      btnLogin.style.display = "inline-block";
      btnLogin.classList.remove("d-none");
    }
    if (btnLogout) {
      btnLogout.style.display = "none";
      btnLogout.classList.add("d-none");
    }
    if (btnAdmin) {
      btnAdmin.style.display = "none";
      btnAdmin.classList.add("d-none");
    }
    if (userInfo) {
      userInfo.innerHTML = "";
      userInfo.style.display = "none";
    }

    console.log("Sin sesión - botón login mostrado");
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  // Mostrar confirmación antes de cerrar sesión
  if (window.Swal) {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Está seguro que desea cerrar la sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("userSession");
        localStorage.removeItem("adminSession");
        localStorage.removeItem("guestSession");

        Swal.fire({
          title: '¡Hasta luego!',
          text: 'Sesión cerrada correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          window.location.href = "login.html";
        });
      }
    });
  } else {
    // Fallback si SweetAlert2 no está disponible
    if (confirm('¿Está seguro que desea cerrar la sesión?')) {
      localStorage.removeItem("userSession");
      localStorage.removeItem("adminSession");
      localStorage.removeItem("guestSession");
      window.location.href = "login.html";
    }
  }
}
