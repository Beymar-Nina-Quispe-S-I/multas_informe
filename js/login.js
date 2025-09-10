// Datos de administradores permitidos (para respaldo si falla Supabase)
const admins = [
  { nombre: "beymar", password: "admin123" },
  { nombre: "romel", password: "admin123" },
];

// Lista de nombres de estudiantes - se cargará desde Supabase
let nombresEstudiantes = [];

// Función para inicializar la página de login
document.addEventListener("DOMContentLoaded", function () {
  // Configurar formulario de usuario
  const formUsuario = document.getElementById("formUsuario");
  if (formUsuario) {
    formUsuario.addEventListener("submit", function (e) {
      e.preventDefault();
      loginUsuario();
    });
  }

  // Configurar formulario de administrador
  const formAdmin = document.getElementById("formAdmin");
  if (formAdmin) {
    formAdmin.addEventListener("submit", function (e) {
      e.preventDefault();
      loginAdmin();
    });
  }

  // Configurar autocompletado para el campo de nombre
  // Verificar si ya hay una sesión activa
  verificarSesion();
});

// Inicializar cuando se carga la página
$(document).ready(async function() {
  // Cargar Supabase
  await loadSupabase();
  
  // Cargar nombres de estudiantes desde Supabase
  await cargarNombresEstudiantes();
  
  // Configurar autocompletado para el campo de nombre de usuario
  $("#nombreUsuario").autocomplete({
    source: nombresEstudiantes,
    minLength: 1,
    select: function(event, ui) {
      console.log("Nombre seleccionado: " + ui.item.value);
    }
  });
});

// Función para cargar nombres desde Supabase
async function cargarNombresEstudiantes() {
  try {
    const estudiantes = await EstudiantesDB.obtenerTodos();
    nombresEstudiantes = estudiantes.map(est => est.nombre);
    console.log('Nombres cargados:', nombresEstudiantes.length);
  } catch (error) {
    console.error('Error al cargar nombres:', error);
    // Fallback a nombres locales
    nombresEstudiantes = [
      "Fernando", "Marck", "Martha", "Maria", "Tania", "Elias", "Jhordan",
      "Rodrigo", "Romel", "Melanie", "Luis", "Jordan", "Nayeli", "Joseph",
      "Jhon", "Olivar", "Mijail", "Anahi Nayeli", "Beymar", "Brayan",
      "Emanuel", "W. Ronad"
    ];
  }
}

// Función para verificar si ya hay una sesión activa
function verificarSesion() {
  const userSession = localStorage.getItem("userSession");
  const adminSession = localStorage.getItem("adminSession");

  if (userSession) {
    window.location.href = "index.html";
    return;
  }

  if (adminSession) {
    window.location.href = "admin.html";
    return;
  }

  // Limpiar cualquier sesión residual
  localStorage.removeItem("adminSession");
  localStorage.removeItem("guestSession");
}

// Función para login de usuario normal
async function loginUsuario() {
  const nombre = document.getElementById("nombreUsuario").value.trim();

  if (!nombre) {
    Swal.fire({
      title: "Error",
      text: "Por favor, ingrese su nombre",
      icon: "error",
      confirmButtonColor: "#1a237e",
    });
    return;
  }

  try {
    // Buscar estudiante en Supabase
    const estudiantes = await EstudiantesDB.obtenerTodos();
    const estudianteEncontrado = estudiantes.find(est => 
      est.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (estudianteEncontrado) {
      const userInfo = {
        id: estudianteEncontrado.id,
        nombre: estudianteEncontrado.nombre,
        apellido: estudianteEncontrado.apellido,
        tipo: "usuario",
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("userSession", JSON.stringify(userInfo));

      Swal.fire({
        title: "¡Bienvenido!",
        text: `Hola ${estudianteEncontrado.nombre}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        window.location.href = "index.html";
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "El nombre no se encuentra en la lista de estudiantes",
        icon: "error",
        confirmButtonColor: "#1a237e",
      });
    }
  } catch (error) {
    console.error('Error en login:', error);
    Swal.fire({
      title: "Error",
      text: "Error al verificar el usuario. Intente nuevamente.",
      icon: "error",
      confirmButtonColor: "#1a237e",
    });
  }
}

// Función para login de administrador
function loginAdmin() {
  const nombre = document
    .getElementById("nombreAdmin")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("passwordAdmin").value.trim();

  if (!nombre || !password) {
    Swal.fire({
      title: "Error",
      text: "Por favor, complete todos los campos",
      icon: "error",
      confirmButtonColor: "#1a237e",
    });
    return;
  }

  // Verificar credenciales con datos locales directamente
  const adminLocal = admins.find(
    (a) => a.nombre === nombre && a.password === password
  );

  if (adminLocal) {
    // Guardar sesión
    const adminSession = {
      id: 0,
      nombre: adminLocal.nombre,
      token: Math.random().toString(36).substring(2) + Date.now().toString(36),
      timestamp: new Date().getTime(),
    };

    localStorage.setItem("adminSession", JSON.stringify(adminSession));

    // Mostrar mensaje de éxito
    Swal.fire({
      title: "¡Bienvenido!",
      text: `Sesión iniciada correctamente como ${adminLocal.nombre}`,
      icon: "success",
      confirmButtonColor: "#28a745",
      timer: 1500,
      showConfirmButton: false
    });

    // Redirigir al panel de administrador después de 1.5 segundos
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1500);
  } else {
    Swal.fire({
      title: "Error de acceso",
      text: "Nombre o contraseña incorrectos",
      icon: "error",
      confirmButtonColor: "#1a237e",
    });
  }
}
