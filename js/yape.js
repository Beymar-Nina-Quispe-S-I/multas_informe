// =====================
// CONFIGURACIÓN YAPE
// =====================
if (!window.yapeConfig) {
  window.yapeConfig = {
    numeroYape: "+59170123456",
    nombreBeneficiario: "Sistema de Multas ITF",
    montoMinimo: 5,
    qrCodeBase: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="
  };
}

// Cargar configuración desde Supabase
async function cargarConfiguracionYape() {
  try {
    const config = await ConfiguracionDB.obtenerYape();
    if (config) {
      window.yapeConfig = { ...window.yapeConfig, ...config };
      console.log("✅ Configuración de Yape cargada");
    }
  } catch (error) {
    console.error("❌ Error al cargar Yape:", error);
  }
}

// Generar QR de Yape
function generarQRYape(monto, concepto, estudiante) {
  const datosQR = {
    numero: window.yapeConfig.numeroYape,
    monto,
    concepto,
    estudiante,
    timestamp: new Date().getTime()
  };
  const datosQRString = JSON.stringify(datosQR);
  return `${window.yapeConfig.qrCodeBase}${encodeURIComponent(datosQRString)}&color=28a745&bgcolor=ffffff`;
}

// Mostrar modal de pago
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
            <p>Escanea el código QR con tu app de Yape</p>
            <div class="qr-container my-3">
              <img src="${generarQRYape(estudiante.deuda, 'Pago de multa', estudiante.nombre)}" alt="QR Yape" class="img-fluid border p-2" style="max-width: 200px;">
            </div>
            <div class="yape-info">
              <p class="mb-1"><strong>Beneficiario:</strong> ${window.yapeConfig.nombreBeneficiario}</p>
              <p class="mb-1"><strong>Número:</strong> ${window.yapeConfig.numeroYape}</p>
              <p class="mb-3"><strong>Monto:</strong> ${estudiante.deuda} Bs.</p>
            </div>
            <div class="alert alert-info">
              <i class="bi bi-info-circle"></i> Una vez realizado el pago, la deuda se actualizará.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-success-custom" id="btnConfirmarPago">Confirmar Pago</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = new bootstrap.Modal(document.getElementById('modalPagoYape'));
  modal.show();

  document.getElementById('btnConfirmarPago').addEventListener('click', () => confirmarPagoYape(estudiante));
}

// Confirmar pago
async function confirmarPagoYape(estudiante) {
  try {
    const btn = document.getElementById('btnConfirmarPago');
    const original = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
    btn.disabled = true;

    const resultado = await EstudiantesDB.actualizarDeuda(estudiante.id, 0);

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
      Swal.fire('Error', 'No se pudo procesar el pago.', 'error');
    }

    btn.innerHTML = original;
    btn.disabled = false;
  } catch (error) {
    console.error('Error confirmar pago:', error);
    Swal.fire('Error', 'Ocurrió un error al procesar el pago.', 'error');
  }
}

// Configurar botones de pago
function configurarBotonesPagoYape() {
  cargarConfiguracionYape();

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-pago-yape')) {
      const estudianteId = e.target.dataset.estudianteId;
      const estudiante = estudiantes.find(est => est.id == estudianteId);

      if (estudiante && estudiante.deuda >= window.yapeConfig.montoMinimo) {
        mostrarModalPagoYape(estudiante);
      } else if (estudiante && estudiante.deuda > 0) {
        Swal.fire('Monto insuficiente', `El monto mínimo es ${window.yapeConfig.montoMinimo} Bs.`, 'warning');
      }
    }
  });
}
