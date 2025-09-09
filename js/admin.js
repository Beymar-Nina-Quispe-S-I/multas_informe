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

// Función para inicializar la página de administrador
document.addEventListener("DOMContentLoaded", function() {
    // Cargar SweetAlert2 para mejores alertas
    cargarSweetAlert();
    
    // Verificar si hay una sesión de administrador activa
    verificarSesionAdmin();
    
    // Mostrar nombre del administrador
    mostrarNombreAdmin();
    
    // Cargar datos del dashboard
    cargarDatosDashboard();
    
    // Cargar tabla de estudiantes
    cargarTablaEstudiantes();
    
    // Configurar botón de logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", cerrarSesion);
    }
    
    // Configurar secciones de administración
    configurarSeccionesAdmin();
    
    // Configurar botón para editar Yape
    const btnEditarYape = document.getElementById("btnEditarYape");
    if (btnEditarYape) {
        btnEditarYape.addEventListener("click", function() {
            editarConfiguracionYape();
        });
    }
});

// Función para cargar SweetAlert2
function cargarSweetAlert() {
    if (!window.Swal) {
        const sweetalertScript = document.createElement("script");
        sweetalertScript.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
        document.body.appendChild(sweetalertScript);
    }
}

// Función para verificar si hay una sesión de administrador activa
async function verificarSesionAdmin() {
    const adminSession = localStorage.getItem("adminSession");
    
    if (!adminSession) {
        // No hay sesión de administrador, redirigir al login
        window.location.href = "login.html";
        return;
    }
    
    try {
        // Verificar token con Supabase
        const adminInfo = JSON.parse(adminSession);
        const tokenValido = await verificarTokenAdmin(adminInfo.nombre, adminInfo.token);
        
        if (!tokenValido) {
            // Token inválido o expirado
            localStorage.removeItem("adminSession");
            window.location.href = "login.html?error=sesion_expirada";
            return;
        }
    } catch (error) {
        console.error("Error al verificar sesión:", error);
        localStorage.removeItem("adminSession");
        window.location.href = "login.html?error=error_verificacion";
    }
}

// Función para cargar la tabla de estudiantes desde Supabase
async function cargarTablaEstudiantes() {
    try {
        // Obtener estudiantes desde Supabase
        const estudiantes = await obtenerEstudiantes();
        
        if (!estudiantes || estudiantes.length === 0) {
            console.warn("No se encontraron estudiantes en la base de datos");
            return;
        }
        
        const tbody = document.getElementById("tablaEstudiantesAdmin");
        if (!tbody) return;
        
        tbody.innerHTML = "";
        
        estudiantes.forEach(estudiante => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${estudiante.id}</td>
                <td>${estudiante.apellido}</td>
                <td>${estudiante.nombre}</td>
                <td>
                    <div class="input-group">
                        <input type="number" class="form-control form-control-sm deuda-input" 
                            value="${estudiante.deuda}" data-estudiante-id="${estudiante.id}">
                        <button class="btn btn-sm btn-outline-success guardar-deuda" 
                            data-estudiante-id="${estudiante.id}">
                            <i class="bi bi-check"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-success btn-pago-yape" data-estudiante-id="${estudiante.id}" 
                            ${estudiante.deuda <= 0 ? 'disabled' : ''}>
                            <i class="bi bi-cash"></i> Yape
                        </button>
                        <button class="btn btn-sm btn-primary editar-estudiante" data-estudiante-id="${estudiante.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Configurar eventos para guardar deudas
        configurarGuardadoDeudas();
        
        // Configurar eventos para editar estudiantes
        configurarEdicionEstudiantes();
        
        // Configurar botones de pago con Yape
        configurarBotonesPagoYape();
        
    } catch (error) {
        console.error("Error al cargar tabla de estudiantes:", error);
    }
}

// Función para configurar el guardado de deudas
function configurarGuardadoDeudas() {
    const botonesGuardar = document.querySelectorAll('.guardar-deuda');
    
    botonesGuardar.forEach(boton => {
        boton.addEventListener('click', async function() {
            const estudianteId = this.getAttribute('data-estudiante-id');
            const inputDeuda = document.querySelector(`.deuda-input[data-estudiante-id="${estudianteId}"]`);
            const nuevaDeuda = parseFloat(inputDeuda.value);
            
            if (isNaN(nuevaDeuda) || nuevaDeuda < 0) {
                Swal.fire({
                    title: 'Error',
                    text: 'El valor de la deuda debe ser un número positivo',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                return;
            }
            
            try {
                // Actualizar deuda en Supabase
                const estudianteActualizado = await actualizarEstudiante(estudianteId, { deuda: nuevaDeuda });
                
                if (estudianteActualizado) {
                    // Mostrar mensaje de éxito
                    Swal.fire({
                        title: '¡Guardado!',
                        text: 'La deuda ha sido actualizada correctamente',
                        icon: 'success',
                        confirmButtonColor: '#28a745',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    
                    // Actualizar botón de Yape
                    const botonYape = document.querySelector(`.btn-pago-yape[data-estudiante-id="${estudianteId}"]`);
                    if (botonYape) {
                        if (nuevaDeuda <= 0) {
                            botonYape.setAttribute('disabled', '');
                        } else {
                            botonYape.removeAttribute('disabled');
                        }
                    }
                    
                    // Actualizar dashboard
                    cargarDatosDashboard();
                    
                    // Actualizar lista de deudores
                    cargarListaDeudores();
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo actualizar la deuda',
                        icon: 'error',
                        confirmButtonColor: '#dc3545'
                    });
                }
            } catch (error) {
                console.error('Error al guardar deuda:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al guardar la deuda',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
            }
        });
    });
}

// Añadir esta función para editar la configuración del fondo
async function editarConfiguracionFondo() {
    try {
        // Obtener configuración actual
        const config = await obtenerConfiguracionFondo();
        
        // Mostrar modal para editar
        Swal.fire({
            title: 'Configuración de Fondo',
            html: `
                <div class="form-group mb-3">
                    <label for="colorFondo" class="form-label">Color de Fondo</label>
                    <input type="color" id="colorFondo" class="form-control" value="${config.color}">
                </div>
                <div class="form-group mb-3">
                    <label for="imagenFondo" class="form-label">URL de Imagen (opcional)</label>
                    <input type="text" id="imagenFondo" class="form-control" value="${config.imagen || ''}">
                    <small class="form-text text-muted">Dejar en blanco para usar solo color</small>
                </div>
                <div class="mt-3 p-2 border rounded" style="background-color: ${config.color}; height: 100px; display: flex; align-items: center; justify-content: center;">
                    <span>Vista previa</span>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            didOpen: () => {
                // Actualizar vista previa al cambiar el color
                const colorInput = document.getElementById('colorFondo');
                const previewDiv = document.querySelector('.mt-3.p-2.border.rounded');
                
                colorInput.addEventListener('input', function() {
                    previewDiv.style.backgroundColor = this.value;
                });
            },
            preConfirm: () => {
                const color = document.getElementById('colorFondo').value;
                const imagen = document.getElementById('imagenFondo').value;
                
                if (!color) {
                    Swal.showValidationMessage('El color es obligatorio');
                    return false;
                }
                
                return { color, imagen: imagen || null };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Actualizar configuración en Supabase
                    const actualizado = await actualizarConfiguracionFondo(result.value);
                    
                    if (actualizado) {
                        Swal.fire(
                            '¡Guardado!',
                            'La configuración de fondo ha sido actualizada.',
                            'success'
                        );
                        
                        // Actualizar vista previa
                        const fondoPreview = document.querySelector('.fondo-preview');
                        if (fondoPreview) {
                            fondoPreview.style.backgroundColor = result.value.color;
                            if (result.value.imagen) {
                                fondoPreview.style.backgroundImage = `url(${result.value.imagen})`;
                                fondoPreview.style.backgroundSize = 'cover';
                                fondoPreview.style.backgroundPosition = 'center';
                            } else {
                                fondoPreview.style.backgroundImage = 'none';
                            }
                        }
                    } else {
                        Swal.fire(
                            'Error',
                            'No se pudo actualizar la configuración.',
                            'error'
                        );
                    }
                } catch (error) {
                    console.error('Error al actualizar configuración:', error);
                    Swal.fire(
                        'Error',
                        'Ocurrió un error al guardar la configuración.',
                        'error'
                    );
                }
            }
        });
    } catch (error) {
        console.error('Error al editar configuración de fondo:', error);
    }
}

// Función para mostrar el nombre del administrador
function mostrarNombreAdmin() {
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession) {
        const adminInfo = JSON.parse(adminSession);
        const adminNameElement = document.getElementById("adminName");
        if (adminNameElement) {
            adminNameElement.textContent = adminInfo.nombre.charAt(0).toUpperCase() + adminInfo.nombre.slice(1);
        }
    }
}

// Función para cargar los datos del dashboard
function cargarDatosDashboard() {
    // Total de estudiantes
    const totalEstudiantes = estudiantes.length;
    const totalEstudiantesElement = document.getElementById("totalEstudiantes");
    if (totalEstudiantesElement) {
        totalEstudiantesElement.textContent = totalEstudiantes;
    }
    
    // Total de estudiantes con deuda
    const deudores = estudiantes.filter(est => est.deuda > 0);
    const totalDeudores = deudores.length;
    const totalDeudoresElement = document.getElementById("totalDeudores");
    if (totalDeudoresElement) {
        totalDeudoresElement.textContent = totalDeudores;
    }
    
    // Total recaudado (suma de todas las deudas)
    const totalRecaudado = estudiantes.reduce((total, est) => total + est.deuda, 0);
    const totalRecaudadoElement = document.getElementById("totalRecaudado");
    if (totalRecaudadoElement) {
        totalRecaudadoElement.textContent = `${totalRecaudado} Bs.`;
    }
}

// Función para cargar la tabla de estudiantes
function cargarTablaEstudiantes() {
    const tbody = document.getElementById("tablaEstudiantesAdmin");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    estudiantes.forEach(estudiante => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${estudiante.id}</td>
            <td>${estudiante.apellido}</td>
            <td>${estudiante.nombre}</td>
            <td>${estudiante.deuda} Bs.</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editarEstudiante(${estudiante.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-danger" onclick="eliminarEstudiante(${estudiante.id})"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para editar un estudiante (simulada)
function editarEstudiante(id) {
    alert(`Editar estudiante con ID: ${id}`);
    // Aquí iría la lógica para editar un estudiante
}

// Función para eliminar un estudiante (simulada)
function eliminarEstudiante(id) {
    if (confirm(`¿Está seguro que desea eliminar al estudiante con ID: ${id}?`)) {
        alert(`Estudiante con ID: ${id} eliminado`);
        // Aquí iría la lógica para eliminar un estudiante
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem("adminSession");
    window.location.href = "login.html";
}

// Función para configurar las secciones de administración
function configurarSeccionesAdmin() {
    // Configurar pestaña de edición de fondo
    const btnEditarFondo = document.getElementById("btnEditarFondo");
    if (btnEditarFondo) {
        btnEditarFondo.addEventListener("click", mostrarEditorFondo);
    }
    
    // Configurar botones de edición de estudiantes
    document.querySelectorAll(".btn-editar-estudiante").forEach(btn => {
        btn.addEventListener("click", function() {
            const id = this.getAttribute("data-id");
            editarEstudiante(id);
        });
    });
}

// Función para mostrar el editor de fondo
function mostrarEditorFondo() {
    // Crear modal para editar fondo
    const modalHTML = `
    <div class="modal fade" id="modalEditarFondo" tabindex="-1" aria-labelledby="modalEditarFondoLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="modalEditarFondoLabel">Editar Fondo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="formEditarFondo">
                        <div class="mb-3">
                            <label for="colorFondo" class="form-label">Color de Fondo</label>
                            <input type="color" class="form-control form-control-color w-100" id="colorFondo" value="#f8f9fa">
                        </div>
                        <div class="mb-3">
                            <label for="imagenFondo" class="form-label">Imagen de Fondo (opcional)</label>
                            <input type="file" class="form-control" id="imagenFondo" accept="image/*">
                        </div>
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="aplicarATodo">
                            <label class="form-check-label" for="aplicarATodo">
                                Aplicar a todas las páginas
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="btnGuardarFondo">Guardar Cambios</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Añadir modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarFondo'));
    modal.show();
    
    // Configurar botón de guardar
    document.getElementById('btnGuardarFondo').addEventListener('click', guardarCambiosFondo);
}

// Función para guardar cambios de fondo
function guardarCambiosFondo() {
    const color = document.getElementById('colorFondo').value;
    const imagenInput = document.getElementById('imagenFondo');
    const aplicarATodo = document.getElementById('aplicarATodo').checked;
    
    // Aquí se implementaría la lógica para guardar en Supabase
    // Por ahora, simulamos el cambio localmente
    document.querySelector('.fondo-seccion').style.backgroundColor = color;
    
    // Cerrar modal
    bootstrap.Modal.getInstance(document.getElementById('modalEditarFondo')).hide();
    
    // Mostrar mensaje de éxito
    alert('Cambios guardados correctamente');
}

// Función para editar un estudiante
function editarEstudiante(id) {
    // Buscar estudiante por ID
    const estudiante = estudiantes.find(est => est.id == id);
    if (!estudiante) return;
    
    // Crear modal para editar estudiante
    const modalHTML = `
    <div class="modal fade" id="modalEditarEstudiante" tabindex="-1" aria-labelledby="modalEditarEstudianteLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="modalEditarEstudianteLabel">Editar Estudiante</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="formEditarEstudiante">
                        <input type="hidden" id="estudianteId" value="${estudiante.id}">
                        <div class="mb-3">
                            <label for="editNombre" class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="editNombre" value="${estudiante.nombre}">
                        </div>
                        <div class="mb-3">
                            <label for="editApellido" class="form-label">Apellido</label>
                            <input type="text" class="form-control" id="editApellido" value="${estudiante.apellido}">
                        </div>
                        <div class="mb-3">
                            <label for="editDeuda" class="form-label">Deuda (Bs.)</label>
                            <input type="number" class="form-control" id="editDeuda" value="${estudiante.deuda}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="btnGuardarEstudiante">Guardar Cambios</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Añadir modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarEstudiante'));
    modal.show();
    
    // Configurar botón de guardar
    document.getElementById('btnGuardarEstudiante').addEventListener('click', guardarCambiosEstudiante);
}

// Función para guardar cambios de estudiante
function guardarCambiosEstudiante() {
    const id = document.getElementById('estudianteId').value;
    const nombre = document.getElementById('editNombre').value;
    const apellido = document.getElementById('editApellido').value;
    const deuda = document.getElementById('editDeuda').value;
    
    // Aquí se implementaría la lógica para guardar en Supabase
    // Por ahora, actualizamos el array local
    const index = estudiantes.findIndex(est => est.id == id);
    if (index !== -1) {
        estudiantes[index].nombre = nombre;
        estudiantes[index].apellido = apellido;
        estudiantes[index].deuda = parseFloat(deuda);
        
        // Actualizar tabla
        cargarTablaEstudiantes();
    }
    
    // Cerrar modal
    bootstrap.Modal.getInstance(document.getElementById('modalEditarEstudiante')).hide();
    
    // Mostrar mensaje de éxito
    alert('Estudiante actualizado correctamente');
}