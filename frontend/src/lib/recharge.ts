import { supabase } from "./supabase";

export async function recargarDineroBackend(cantidad: number) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) throw new Error("Usuario no autenticado");

  const res = await fetch(
    "https://ufrypzqkfdxzdccryrsw.supabase.co/functions/v1/recharge-money",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id: session.user.id,
        cantidad,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Error en recarga");

  return data;
}