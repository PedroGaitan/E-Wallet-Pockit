import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Rutas de autenticación */}
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />

      {/* Este es tu layout de pestañas principales */}
      <Stack.Screen name="views" options={{ headerShown: false }} />

      {/* Estas son las nuevas pantallas fuera del tab */}
      <Stack.Screen
        name="recargardinero"
        options={{ title: "Recargar Dinero" }}
      />
      <Stack.Screen name="enviardinero" options={{ title: "Enviar Dinero" }} />
    </Stack>
  );
}
