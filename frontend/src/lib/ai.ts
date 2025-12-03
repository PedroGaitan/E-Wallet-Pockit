import { supabase } from "./supabase";

export async function askGemini(message: string) {
  try {
    const { data, error } = await supabase.functions.invoke("ai", {
      body: { message },
    });

    console.log("RAW DATA:", data);
    console.log("RAW ERROR:", error);

    if (error) {
      return "Error al conectar con soporte. Intenta nuevamente.";
    }

    return data?.reply ?? "Respuesta vacía.";
  } catch (e) {
    console.log("Invoke exception:", e);
    return "Error al conectar con soporte. Intenta nuevamente.";
  }
}
