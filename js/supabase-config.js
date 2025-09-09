// Configuración de Supabase
const SUPABASE_URL = "https://ufszdegduazhochsrkti.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmc3pkZWdkdWF6aG9jaHNya3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NjIwMDQsImV4cCI6MjA3MzAzODAwNH0.3bUMfSA486LxBIAoo_QQFegWFwNCxUco2v7zCAD0hns";

// Inicializar cliente de Supabase
let supabaseClient;

// Función para inicializar Supabase
function inicializarSupabase() {
  if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase inicializado correctamente");
    return true;
  } else {
    console.error("Error: La librería de Supabase no está cargada");
    return false;
  }
}

// Funciones para interactuar con la base de datos

// Obtener todos los estudiantes
async function obtenerEstudiantes() {
  if (!supabaseClient && !inicializarSupabase()) return [];
  
  try {
    const { data, error } = await supabaseClient
      .from("estudiantes")
      .select("*")
      .order('apellido', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    return [];
  }
}

// Obtener estudiantes con deuda
async function obtenerEstudiantesConDeuda() {
  if (!supabaseClient && !inicializarSupabase()) return [];
  
  try {
    const { data, error } = await supabaseClient
      .from("estudiantes")
      .select("*")
      .gt("deuda", 0)
      .order('deuda', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al obtener estudiantes con deuda:", error);
    return [];
  }
}

// Actualizar datos de un estudiante
async function actualizarEstudiante(id, datos) {
  if (!supabaseClient && !inicializarSupabase()) return null;
  
  try {
    datos.updated_at = new Date();
    
    const { data, error } = await supabaseClient
      .from("estudiantes")
      .update(datos)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error al actualizar estudiante:", error);
    return null;
  }
}

// Obtener configuración de Yape
async function obtenerConfiguracionYape() {
  if (!supabaseClient && !inicializarSupabase()) return { numero: "+59170123456", nombre: "Sistema de Multas ITF" };
  
  try {
    const { data, error } = await supabaseClient
      .from("configuracion")
      .select("valor")
      .eq("tipo", "yape")
      .single();

    if (error) throw error;
    return data.valor;
  } catch (error) {
    console.error("Error al obtener configuración de Yape:", error);
    return { numero: "+59170123456", nombre: "Sistema de Multas ITF" };
  }
}

// Actualizar configuración de Yape
async function actualizarConfiguracionYape(datos) {
  if (!supabaseClient && !inicializarSupabase()) return null;
  
  try {
    const { data, error } = await supabaseClient
      .from("configuracion")
      .update({ valor: datos, updated_at: new Date() })
      .eq("tipo", "yape")
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error al actualizar configuración de Yape:", error);
    return null;
  }
}

// Obtener configuración de fondo
async function obtenerConfiguracionFondo() {
  if (!supabaseClient && !inicializarSupabase()) return { color: "#f8f9fa", imagen: null };
  
  try {
    const { data, error } = await supabaseClient
      .from("configuracion")
      .select("valor")
      .eq("tipo", "fondo")
      .single();

    if (error) throw error;
    return data.valor;
  } catch (error) {
    console.error("Error al obtener configuración de fondo:", error);
    return { color: "#f8f9fa", imagen: null };
  }
}

// Actualizar configuración de fondo
async function actualizarConfiguracionFondo(datos) {
  if (!supabaseClient && !inicializarSupabase()) return null;
  
  try {
    const { data, error } = await supabaseClient
      .from("configuracion")
      .update({ valor: datos, updated_at: new Date() })
      .eq("tipo", "fondo")
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error al actualizar configuración de fondo:", error);
    return null;
  }
}

// Registrar un pago
async function registrarPago(estudianteId, monto, metodo, referencia = null) {
  if (!supabaseClient && !inicializarSupabase()) return null;
  
  try {
    // Crear el registro de pago
    const { data: pago, error: pagoError } = await supabaseClient
      .from("pagos")
      .insert({
        estudiante_id: estudianteId,
        monto: monto,
        metodo: metodo,
        estado: "completado",
        referencia: referencia
      })
      .select();

    if (pagoError) throw pagoError;
    
    // Actualizar la deuda del estudiante
    const { data: estudiante, error: estudianteError } = await supabaseClient
      .from("estudiantes")
      .select("deuda")
      .eq("id", estudianteId)
      .single();
      
    if (estudianteError) throw estudianteError;
    
    const nuevaDeuda = Math.max(0, parseFloat(estudiante.deuda) - parseFloat(monto));
    
    const { data: estudianteActualizado, error: actualizacionError } = await supabaseClient
      .from("estudiantes")
      .update({ deuda: nuevaDeuda, updated_at: new Date() })
      .eq("id", estudianteId)
      .select();
      
    if (actualizacionError) throw actualizacionError;
    
    return { pago: pago[0], estudiante: estudianteActualizado[0] };
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return null;
  }
}

// Verificar credenciales de administrador
async function verificarCredencialesAdmin(nombre, password) {
  if (!supabaseClient && !inicializarSupabase()) return null;
  
  try {
    const { data, error } = await supabaseClient
      .from("administradores")
      .select("*")
      .eq("nombre", nombre.toLowerCase())
      .eq("password", password)
      .single();

    if (error) throw error;
    
    // Generar token y actualizar último acceso
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const ahora = new Date();
    
    const { data: adminActualizado, error: actualizacionError } = await supabaseClient
      .from("administradores")
      .update({ 
        token: token,
        ultimo_acceso: ahora,
        updated_at: ahora
      })
      .eq("id", data.id)
      .select();
      
    if (actualizacionError) throw actualizacionError;
    
    return adminActualizado[0];
  } catch (error) {
    console.error("Error al verificar credenciales:", error);
    return null;
  }
}

// Verificar token de administrador
async function verificarTokenAdmin(nombre, token) {
  if (!supabaseClient && !inicializarSupabase()) return false;
  
  try {
    const { data, error } = await supabaseClient
      .from("administradores")
      .select("*")
      .eq("nombre", nombre.toLowerCase())
      .eq("token", token)
      .single();

    if (error) return false;
    
    // Verificar si el token ha expirado (2 horas)
    const ultimoAcceso = new Date(data.ultimo_acceso);
    const ahora = new Date();
    const tiempoTranscurrido = ahora - ultimoAcceso;
    const tiempoMaximo = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
    
    if (tiempoTranscurrido > tiempoMaximo) {
      return false;
    }
    
    // Actualizar último acceso
    await supabaseClient
      .from("administradores")
      .update({ 
        ultimo_acceso: ahora,
        updated_at: ahora
      })
      .eq("id", data.id);
    
    return true;
  } catch (error) {
    console.error("Error al verificar token:", error);
    return false;
  }
}
