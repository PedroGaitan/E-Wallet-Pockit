import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { logActivity, getRecentActivity } from "../lib/security";
import * as Device from "expo-device";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
  created_at?: string;
}

interface AuthContextType {
  user: Usuario | null;
  mounting: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [mounting, setMounting] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      // Si NO hay sesión
      if (!sessionData?.session?.user) {
        if (mounted) {
          setUser(null);
          setMounting(false);
        }
        return;
      }

      const authUser = sessionData.session.user;

      // ----------- 🔥 LOG #1 → Registrar Login / Refresh Session -----------
      logActivity(authUser.id, "Inicio de sesión");

      // ----------- 🔥 LOG #2 → Detectar "Nuevo dispositivo" -----------
      try {
        const model = Device.modelName;

        const history = await getRecentActivity(authUser.id, 30);
        const previousModels = history.map((h) => h.device_model);

        if (!previousModels.includes(model)) {
          logActivity(authUser.id, "Inicio desde un nuevo dispositivo");
        }
      } catch (e) {
        console.log("Error checking device:", e);
      }

      // Cargar perfil del usuario
      const { data: perfil } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (mounted) {
        setUser(perfil as Usuario);
        setMounting(false);
      }
    };

    loadUser();

    // -- Listener de cambio de sesión (login / logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // LOGIN
        if (event === "SIGNED_IN" && session?.user) {
          logActivity(session.user.id, "Inicio de sesión");
        }

        // LOGOUT
        if (event === "SIGNED_OUT" && user?.id) {
          logActivity(user.id, "Cierre de sesión");
        }

        loadUser();
      }
    );

    // -- Listener realtime usuarios
    const channel = supabase
      .channel("users-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          const updated = payload.new as Usuario;
          setUser((prev) => (prev?.id === updated.id ? updated : prev));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, mounting }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
