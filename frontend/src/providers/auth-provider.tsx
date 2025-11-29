import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";

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
    let mounted = true; // evita setState cuando desmonta

    const loadUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session?.user) {
        if (mounted) {
          setUser(null);
          setMounting(false);
        }
        return;
      }

      const authUser = sessionData.session.user;

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
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    // -- Listener realtime SOLO una vez
    const channel = supabase
      .channel("users-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          const updated = payload.new as Usuario;

          // si no es el usuario logueado → ignorar
          setUser((prev) => (prev?.id === updated.id ? updated : prev));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []); // ⬅ se ejecuta UNA sola vez

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
