import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
// import Purchases from "react-native-purchases";

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

// REVENUECAT DISABLED FOR PRODUCTION BUILD
// Track last RevenueCat user to avoid duplicate login calls
// let lastRevenueCatUserId: string | null = null;

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
          // REVENUECAT DISABLED FOR PRODUCTION BUILD
          // try {
          //   // Solo hacer logout si el usuario NO es anónimo
          //   const customerInfo = await Purchases.getCustomerInfo();
          //   if (!customerInfo.originalAppUserId.startsWith("$RCAnonymousID:")) {
          //     await Purchases.logOut();
          //     lastRevenueCatUserId = null;
          //   }
          // } catch {}
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

        // REVENUECAT DISABLED FOR PRODUCTION BUILD
        // Identify user in RevenueCat (only if different from last login)
        // if (authUser.id && authUser.id !== lastRevenueCatUserId) {
        //   try {
        //     await Purchases.logIn(authUser.id);
        //     lastRevenueCatUserId = authUser.id;
        //   } catch (e) {
        //     // Ignore duplicate request errors (code 16, statusCode 429)
        //     const error = e as { code?: number };
        //     if (error.code !== 16) {
        //       console.error("RevenueCat login error:", e);
        //     }
        //   }
        // }
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

  const value = useMemo(() => ({ user, mounting }), [user, mounting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
