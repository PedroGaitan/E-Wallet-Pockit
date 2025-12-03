import { supabase } from "./supabase";
import * as Device from "expo-device";
import { Platform } from "react-native";


export async function logActivity(
  userId: string,
  action: string,
  status: "success" | "failed" = "success"
) {
  const device_name = Device.deviceName ?? null;
  const device_model = Device.modelName ?? null;
  const platform = Platform.OS;
  const os_version = Device.osVersion ?? null;

  const { error } = await supabase.from("security_activity").insert({
    user_id: userId,
    action,
    device_name,
    device_model,
    platform,
    os_version,
    status,
  });

  if (error) console.log("Error saving activity:", error);
}

export async function getRecentActivity(userId: string, limit: number = 15) {
  const { data, error } = await supabase
    .from("security_activity")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) console.log("Error fetching logs:", error);
  return data ?? [];
}
