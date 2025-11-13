import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="views" options={{ headerShown: false }} />
      <Stack.Screen name="recargardinero"options={{ title: "Recargar Dinero" }}/>
      <Stack.Screen name="enviardinero" options={{ title: "Enviar Dinero" }} />
      <Stack.Screen name="completarperfil" options={{ headerShown: false }} /> 
    </Stack>
  );
}