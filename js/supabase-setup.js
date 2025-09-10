// Configuración de Supabase para el sistema de multas
const SUPABASE_URL = 'https://cgvhokfwcxxmapdceyxg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmhva2Z3Y3h4bWFwZGNleXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1Mzg4NzcsImV4cCI6MjA3MzExNDg3N30.52FU6yrub6mJoMM13Sw_ND6ClmTTsGXoH8s3q9oBqd4'; // recorté por seguridad

// Variable global para el cliente
let supabase = null;

// Función de debug para probar conexión
async function testSupabaseConnection() {
    try {
        console.log('🔍 Probando conexión a Supabase...');

        if (!window.supabaseClient) {
            console.error('❌ Cliente Supabase no inicializado');
            return false;
        }

        const { data, error } = await window.supabaseClient
            .from('estudiantes')
            .select('count(*)')
            .limit(1);

        if (error) throw error;

        console.log('✅ Conexión exitosa. Datos:', data);
        return true;
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        return false;
    }
}

// Inicializar cliente Supabase
function initializeSupabase() {
    try {
        if (!window.supabase || !window.supabase.createClient) {
            throw new Error('Supabase library not loaded');
        }

        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Guardar referencia global única
        window.supabaseClient = client;
        supabase = client;

        console.log('✅ SUPABASE INICIALIZADO');
        return true;
    } catch (error) {
        console.error('❌ ERROR EN INICIALIZACIÓN:', error);
        return false;
    }
}

// Cargar Supabase desde CDN
function loadSupabase() {
    return new Promise((resolve, reject) => {
        if (window.supabaseClient) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            if (initializeSupabase()) resolve();
            else reject(new Error('Init failed'));
        };
        script.onerror = () => reject(new Error('Error al cargar Supabase'));
        document.head.appendChild(script);
    });
}

// =====================
// FUNCIONES ESTUDIANTES
// =====================
class EstudiantesDB {
    static async obtenerTodos() {
        try {
            const { data, error } = await window.supabaseClient
                .from('estudiantes')
                .select('*')
                .order('apellido', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error al obtener estudiantes:', error);
            return [];
        }
    }

    static async obtenerConDeuda() {
        try {
            const { data, error } = await window.supabaseClient
                .from('estudiantes')
                .select('*')
                .gt('deuda', 0)
                .order('deuda', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error al obtener deudores:', error);
            return [];
        }
    }

    static async actualizarDeuda(id, nuevaDeuda) {
        try {
            const { data, error } = await window.supabaseClient
                .from('estudiantes')
                .update({
                    deuda: nuevaDeuda,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error al actualizar deuda:', error);
            return null;
        }
    }

    static async crear(estudiante) {
        try {
            const { data, error } = await window.supabaseClient
                .from('estudiantes')
                .insert([{
                    apellido: estudiante.apellido,
                    nombre: estudiante.nombre,
                    deuda: estudiante.deuda || 0,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error al crear estudiante:', error);
            return null;
        }
    }

    static suscribirCambios(callback) {
        if (!window.supabaseClient) return null;

        return window.supabaseClient
            .channel('estudiantes-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'estudiantes' },
                (payload) => {
                    console.log('Cambio detectado:', payload);
                    callback(payload);
                }
            )
            .subscribe();
    }
}

// =====================
// FUNCIONES CONFIGURACIÓN
// =====================
class ConfiguracionDB {
    static async obtenerYape() {
        try {
            const { data, error } = await window.supabaseClient
                .from('configuracion')
                .select('*')
                .eq('tipo', 'yape')
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data?.config || {
                nombreBeneficiario: "Sistema Multas ITF",
                numeroYape: "70123456",
                montoMinimo: 1,
                montoMaximo: 1000
            };
        } catch (error) {
            console.error('Error al obtener config Yape:', error);
            return {
                nombreBeneficiario: "Sistema Multas ITF",
                numeroYape: "70123456",
                montoMinimo: 1,
                montoMaximo: 1000
            };
        }
    }

    static async guardarYape(config) {
        try {
            const { data, error } = await window.supabaseClient
                .from('configuracion')
                .upsert({
                    tipo: 'yape',
                    config,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error al guardar config Yape:', error);
            return null;
        }
    }

    static async obtenerFondo() {
        try {
            const { data, error } = await window.supabaseClient
                .from('configuracion')
                .select('*')
                .eq('tipo', 'fondo')
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data?.config || { color: '#f8f9fa', imagen: null };
        } catch (error) {
            console.error('Error al obtener config fondo:', error);
            return { color: '#f8f9fa', imagen: null };
        }
    }

    static async guardarFondo(config) {
        try {
            const { data, error } = await window.supabaseClient
                .from('configuracion')
                .upsert({
                    tipo: 'fondo',
                    config,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error al guardar config fondo:', error);
            return null;
        }
    }
}

// Exportar para uso global
window.EstudiantesDB = EstudiantesDB;
window.ConfiguracionDB = ConfiguracionDB;
window.loadSupabase = loadSupabase;
window.testSupabaseConnection = testSupabaseConnection;
