import { Stack } from "expo-router";

export default function RootLayout() {
  
  return <Stack screenOptions={{headerShown: false, }}>

  <Stack.Screen name="index" options={{ title: 'Home' }} />
  <Stack.Screen name="budgethome" options={{ title: 'BudgetHome' }} />

  </Stack>;
}
