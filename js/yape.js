// Configuración para la API de Yape
if (!window.yapeConfig) {
  window.yapeConfig = {
    numeroYape: "+59170123456", // Número de teléfono boliviano para Yape
    nombreBeneficiario: "Sistema de Multas ITF",
    montoMinimo: 5, // monto mínimo opcional
    qrCodeBase: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="
  };
}

// Cargar configuración de Yape desde Supabase
async function cargarConfiguracionYape() {
  try {
    const config = await obtenerConfiguracionYape();
    if (config) {
      window.yapeConfig = { ...window.yapeConfig, ...config };
      console.log("Configuración de Yape cargada correctamente");
    }
  } catch (error) {
    console.error("Error al cargar configuración de Yape:", error);
  }
}

// Función para generar QR de Yape usando la API de QR Server
function generarQRYape(monto, concepto, estudiante) {
  const datosQR = {
    numero: window.yapeConfig.numeroYape,
    monto: monto,
    concepto: concepto,
    estudiante: estudiante,
    timestamp: new Date().getTime()
  };
  const datosQRString = JSON.stringify(datosQR);
  return `${window.yapeConfig.qrCodeBase}${encodeURIComponent(datosQRString)}&color=28a745&bgcolor=ffffff`;
}

// Función para mostrar modal de pago con Yape
function mostrarModalPagoYape(estudiante) {
  const modalAnterior = document.getElementById('modalPagoYape');
  if (modalAnterior) modalAnterior.remove();

  const modalHTML = `
    <div class="modal fade" id="modalPagoYape" tabindex="-1" aria-labelledby="modalPagoYapeLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title" id="modalPagoYapeLabel">Pagar con Yape</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <h4>Deuda: ${estudiante.deuda} Bs.</h4>
                    <p>Escanea el código QR con tu app de Yape para pagar</p>
                    <div class="qr-container my-3">
                        <img src="${generarQRYape(estudiante.deuda, 'Pago de multa', estudiante.nombre)}" alt="QR Yape" class="img-fluid border p-2" style="max-width: 200px;">
                    </div>
                    <div class="yape-info">
                        <p class="mb-1"><strong>Beneficiario:</strong> ${window.yapeConfig.nombreBeneficiario}</p>
                        <p class="mb-1"><strong>Número:</strong> ${window.yapeConfig.numeroYape}</p>
                        <p class="mb-3"><strong>Monto:</strong> ${estudiante.deuda} Bs.</p>
                    </div>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> Una vez realizado el pago, la deuda se actualizará en el sistema.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-success" id="btnConfirmarPago">Confirmar Pago</button>
                </div>
            </div>
        </div>
    </div>
    `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = new bootstrap.Modal(document.getElementById('modalPagoYape'));
  modal.show();

  document.getElementById('btnConfirmarPago').addEventListener('click', function () {
    confirmarPagoYape(estudiante);
  });
}

// Función para confirmar pago con Yape
async function confirmarPagoYape(estudiante) {
  try {
    const btnConfirmar = document.getElementById('btnConfirmarPago');
    const btnTextoOriginal = btnConfirmar.innerHTML;
    btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
    btnConfirmar.disabled = true;

    const resultado = await registrarPago(
      estudiante.id,
      estudiante.deuda,
      'Yape',
      `Pago Yape - ${new Date().toISOString()}`
    );

    bootstrap.Modal.getInstance(document.getElementById('modalPagoYape')).hide();

    if (resultado) {
      Swal.fire({
        title: '¡Pago Exitoso!',
        text: 'El pago ha sido registrado correctamente.',
        icon: 'success',
        confirmButtonColor: '#28a745'
      });

      if (typeof actualizarTablaEstudiantes === 'function') actualizarTablaEstudiantes();
      if (typeof mostrarEstudiantesConDeudas === 'function') mostrarEstudiantesConDeudas();
      if (typeof cargarDatosDashboard === 'function') cargarDatosDashboard();
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo procesar el pago. Intente nuevamente.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error al procesar el pago. Intente nuevamente.',
      icon: 'error',
      confirmButtonColor: '#dc3545'
    });
  }
}

// Configurar botones de pago con Yape
function configurarBotonesPagoYape() {
  cargarConfiguracionYape();

  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('btn-pago-yape')) {
      const estudianteId = e.target.getAttribute('data-estudiante-id');
      const estudiante = estudiantes.find(est => est.id == estudianteId);

      if (estudiante && estudiante.deuda >= window.yapeConfig.montoMinimo) {
        mostrarModalPagoYape(estudiante);
      } else if (estudiante && estudiante.deuda > 0 && estudiante.deuda < window.yapeConfig.montoMinimo) {
        Swal.fire({
          title: 'Monto insuficiente',
          text: `El monto mínimo para pago con Yape es ${window.yapeConfig.montoMinimo} Bs.`,
          icon: 'warning',
          confirmButtonColor: '#ffc107'
        });
      }
    }
  });
}

// Editar configuración de Yape
async function editarConfiguracionYape() {
  const config = await obtenerConfiguracionYape();

  Swal.fire({
    title: 'Configuración de Yape',
    html: `
            <div class="form-group mb-3">
                <label for="numeroYape" class="form-label">Número de Yape</label>
                <input type="text" id="numeroYape" class="form-control" value="${config.numero}">
            </div>
            <div class="form-group mb-3">
                <label for="nombreBeneficiario" class="form-label">Nombre del Beneficiario</label>
                <input type="text" id="nombreBeneficiario" class="form-control" value="${config.nombreBeneficiario}">
            </div>
        `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#6c757d',
    preConfirm: () => {
      const numero = document.getElementById('numeroYape').value;
      const nombre = document.getElementById('nombreBeneficiario').value;
      if (!numero || !nombre) {
        Swal.showValidationMessage('Todos los campos son obligatorios');
        return false;
      }
      return { numero, nombreBeneficiario: nombre };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const actualizado = await actualizarConfiguracionYape(result.value);
        if (actualizado) {
          window.yapeConfig = result.value;
          Swal.fire('¡Guardado!', 'La configuración de Yape ha sido actualizada.', 'success');
        } else {
          Swal.fire('Error', 'No se pudo actualizar la configuración.', 'error');
        }
      } catch (error) {
        console.error('Error al actualizar configuración:', error);
        Swal.fire('Error', 'Ocurrió un error al guardar la configuración.', 'error');
      }
    }
  });
}
