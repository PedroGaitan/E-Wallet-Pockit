import { supabase } from "./supabase";

export async function enviarDineroBackend(
  remitente_id: string,
  receptor_id: string,
  cantidad: number
) {
  const session = (await supabase.auth.getSession()).data.session;

  if (!session) {
    throw new Error("Usuario no autenticado");
  }

  const res = await fetch(
    "https://ufrypzqkfdxzdccryrsw.supabase.co/functions/v1/send-money",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        remitente_id,
        receptor_id,
        cantidad,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error en transferencia");
  }

  return data;
}
