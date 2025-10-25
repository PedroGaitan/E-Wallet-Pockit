import { Redirect } from "expo-router";

export default function Index() {
  // Redirige al home dentro de tus tabs
  return <Redirect href="../auth/login" />;
}
