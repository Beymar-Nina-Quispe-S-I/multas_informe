// =====================
// CONFIGURACIÓN SUPABASE
// =====================
const SUPABASE_URL = 'https://cgvhokfwcxxmapdceyxg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmhva2Z3Y3h4bWFwZGNleXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1Mzg4NzcsImV4cCI6MjA3MzExNDg3N30.52FU6yrub6mJoMM13Sw_ND6ClmTTsGXoH8s3q9oBqd4';

let supabase = null;

// =====================
// INICIALIZACIÓN SUPABASE
// =====================
function initializeSupabase() {
    if (!window.supabase) {
        throw new Error("❌ Supabase library not loaded");
    }

    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabase;
    console.log("✅ SUPABASE INICIALIZADO");
    return supabase;
}

// Cargar Supabase dinámicamente si no está
function loadSupabase() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve(initializeSupabase());
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js';
        script.onload = () => {
            try {
                resolve(initializeSupabase());
            } catch (err) {
                reject(err);
            }
        };
        script.onerror = () => reject(new Error("❌ Error al cargar Supabase"));
        document.head.appendChild(script);
    });
}

// =====================
// TEST DE CONEXIÓN
// =====================
async function testSupabaseConnection() {
    try {
        if (!supabase) {
            console.error("❌ Cliente Supabase no inicializado");
            return false;
        }

        const { data, error } = await supabase.from('estudiantes').select('id').limit(1);
        if (error) throw error;

        console.log("✅ Conexión Supabase OK:", data);
        return true;
    } catch (error) {
        console.error("❌ Error de conexión:", error);
        return false;
    }
}

// =====================
// CLASE ESTUDIANTESDB
// =====================
class EstudiantesDB {
    static async obtenerTodos() {
        try {
            const { data, error } = await supabase
                .from('estudiantes')
                .select('*')
                .order('apellido', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error al obtener estudiantes:", error);
            return [];
        }
    }

    static async obtenerConDeuda() {
        try {
            const { data, error } = await supabase
                .from('estudiantes')
                .select('*')
                .gt('deuda', 0)
                .order('deuda', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error al obtener deudores:", error);
            return [];
        }
    }

    static async actualizarDeuda(id, nuevaDeuda) {
        try {
            const { data, error } = await supabase
                .from('estudiantes')
                .update({ deuda: nuevaDeuda, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error("Error al actualizar deuda:", error);
            return null;
        }
    }

    static async crear(estudiante) {
        try {
            const { data, error } = await supabase
                .from('estudiantes')
                .insert([{ ...estudiante, created_at: new Date().toISOString() }])
                .select();
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error("Error al crear estudiante:", error);
            return null;
        }
    }

    static suscribirCambios(callback) {
        if (!supabase) return null;

        return supabase
            .channel('estudiantes-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'estudiantes' }, callback)
            .subscribe();
    }
}

// =====================
// CLASE CONFIGURACIONDB
// =====================
class ConfiguracionDB {
    static async obtenerYape() {
        try {
            const { data, error } = await supabase
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
            console.error("Error al obtener config Yape:", error);
            return { nombreBeneficiario: "Sistema Multas ITF", numeroYape: "70123456", montoMinimo: 1, montoMaximo: 1000 };
        }
    }

    static async guardarYape(config) {
        try {
            const { data, error } = await supabase
                .from('configuracion')
                .upsert({ tipo: 'yape', config, updated_at: new Date().toISOString() })
                .select();
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error("Error al guardar config Yape:", error);
            return null;
        }
    }
}

// =====================
// EXPORT GLOBAL
// =====================
window.EstudiantesDB = EstudiantesDB;
window.ConfiguracionDB = ConfiguracionDB;
window.loadSupabase = loadSupabase;
window.testSupabaseConnection = testSupabaseConnection;
