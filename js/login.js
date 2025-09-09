// Datos de administradores permitidos (para respaldo si falla Supabase)
const admins = [
    { nombre: "beymar", password: "admin123" },
    { nombre: "romel", password: "admin123" }
];

// Lista de nombres de estudiantes para autocompletado
const nombresEstudiantes = [
    "Fernando", "Marck", "Martha", "Maria", "Tania", "Elias", "Jhordan", 
    "Rodrigo", "Romel", "Melanie", "Luis", "Jordan", "Nayeli", "Joseph", 
    "Jhon", "Olivar", "Mijail", "Anahi", "Beymar", "Brayan", "Emanuel", "Ronald"
];

// Función para inicializar la página de login
document.addEventListener("DOMContentLoaded", function() {
    // Configurar formulario de usuario
    const formUsuario = document.getElementById("formUsuario");
    if (formUsuario) {
        formUsuario.addEventListener("submit", function(e) {
            e.preventDefault();
            loginUsuario();
        });
    }

    // Configurar formulario de administrador
    const formAdmin = document.getElementById("formAdmin");
    if (formAdmin) {
        formAdmin.addEventListener("submit", function(e) {
            e.preventDefault();
            loginAdmin();
        });
    }
    
    // Configurar autocompletado para el campo de nombre
    configurarAutocompletado();

    // Verificar si ya hay una sesión activa
    verificarSesion();
});

// Función para configurar autocompletado
function configurarAutocompletado() {
    if (window.jQuery && $.ui) {
        $("#nombreUsuario").autocomplete({
            source: nombresEstudiantes,
            minLength: 2,
            autoFocus: true,
            classes: {
                "ui-autocomplete": "custom-autocomplete"
            }
        });
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
    localStorage.removeItem("userSession");
    localStorage.removeItem("adminSession");
    localStorage.removeItem("guestSession");
}

// Función para login de usuario normal
function loginUsuario() {
    const nombre = document.getElementById("nombreUsuario").value.trim();
    const correo = document.getElementById("correoUsuario").value.trim();

    if (!nombre || !correo) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, complete todos los campos',
            icon: 'error',
            confirmButtonColor: '#1a237e'
        });
        return;
    }

    // Verificar si el nombre está en la lista de estudiantes
    // Simulamos una verificación básica (en un caso real, esto se haría con una API)
    fetch("js/main.js")
        .then(response => response.text())
        .then(data => {
            // Verificamos si el nombre aparece en el archivo main.js (donde están los estudiantes)
            if (data.toLowerCase().includes(nombre.toLowerCase())) {
                // Guardar sesión
                const userInfo = {
                    nombre: nombre,
                    correo: correo,
                    tipo: "usuario",
                    timestamp: new Date().getTime()
                };
                localStorage.setItem("userSession", JSON.stringify(userInfo));
                
                // Redirigir a la página principal
                window.location.href = "index.html";
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'El nombre no se encuentra en la lista de estudiantes',
                    icon: 'error',
                    confirmButtonColor: '#1a237e'
                });
            }
        })
        .catch(error => {
            console.error("Error al verificar el usuario:", error);
            Swal.fire({
                title: 'Error',
                text: 'Error al verificar el usuario. Intente nuevamente.',
                icon: 'error',
                confirmButtonColor: '#1a237e'
            });
        });
}

// Función para login de administrador
async function loginAdmin() {
    const nombre = document.getElementById("nombreAdmin").value.trim().toLowerCase();
    const password = document.getElementById("passwordAdmin").value.trim();

    if (!nombre || !password) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, complete todos los campos',
            icon: 'error',
            confirmButtonColor: '#1a237e'
        });
        return;
    }

    try {
        // Intentar verificar credenciales con Supabase
        let admin = await verificarCredencialesAdmin(nombre, password);
        
        // Si falla Supabase, verificar con datos locales como respaldo
        if (!admin) {
            const adminLocal = admins.find(a => a.nombre === nombre && a.password === password);
            if (adminLocal) {
                admin = {
                    id: 0,
                    nombre: adminLocal.nombre,
                    token: Math.random().toString(36).substring(2) + Date.now().toString(36),
                };
            }
        }
        
        if (admin) {
            // Guardar sesión
            const adminSession = {
                id: admin.id,
                nombre: admin.nombre,
                token: admin.token,
                timestamp: new Date().getTime()
            };
            
            localStorage.setItem("adminSession", JSON.stringify(adminSession));
            
            // Redirigir al panel de administrador
            window.location.href = "admin.html";
        } else {
            Swal.fire({
                title: 'Error de acceso',
                text: 'Nombre o contraseña incorrectos',
                icon: 'error',
                confirmButtonColor: '#1a237e'
            });
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al iniciar sesión',
            icon: 'error',
            confirmButtonColor: '#1a237e'
        });
    }
}