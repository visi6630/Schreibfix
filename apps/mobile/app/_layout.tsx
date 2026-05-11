import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#F97316" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
