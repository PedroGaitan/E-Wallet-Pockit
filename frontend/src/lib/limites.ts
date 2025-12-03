import { supabase } from "./supabase";

export async function validarLimite(
  user_id: string,
  cantidad: number,
  tipo: "transferencia" | "recarga"
) {
  const session = (await supabase.auth.getSession()).data.session;

  if (!session) {
    throw new Error("Usuario no autenticado");
  }

  const res = await fetch(
    "https://ufrypzqkfdxzdccryrsw.supabase.co/functions/v1/limite-saldo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id,
        cantidad,
        tipo, // ✅ ahora sí viaja correctamente
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Límite superado");
  }

  return data;
}