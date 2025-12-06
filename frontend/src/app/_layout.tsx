import { Stack } from "expo-router";
import { AuthProvider } from "../providers/auth-provider";
import { ThemeProvider } from "../context/ThemeContext";
import React from "react";
// import { Platform } from "react-native";
// import Purchases, { LOG_LEVEL } from "react-native-purchases";

export default function RootLayout() {
  // REVENUECAT DISABLED FOR PRODUCTION BUILD
  // useEffect(() => {
  //   Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  //
  //   if (Platform.OS === "ios") {
  //     Purchases.configure({ apiKey: "test_fuNnroMRBeuNEbWnWrjSzEqqPDW" });
  //   } else if (Platform.OS === "android") {
  //     Purchases.configure({ apiKey: "test_fuNnroMRBeuNEbWnWrjSzEqqPDW" });
  //   }
  // }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="views" options={{ headerShown: false }} />
          <Stack.Screen
            name="recargardinero"
            options={{ title: "Recargar Dinero" }}
          />
          <Stack.Screen
            name="enviardinero"
            options={{ title: "Enviar Dinero" }}
          />
          <Stack.Screen
            name="completarperfil"
            options={{ headerShown: false }}
          />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
