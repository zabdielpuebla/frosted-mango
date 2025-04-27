

import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="budgethome"
        options={{ title: 'Home', tabBarLabel: 'Home' }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'Transactions', tabBarLabel: 'Transactions' }}
      />
      <Tabs.Screen
        name="account"
        options={{title: 'Account', tabBarLabel: 'Account'}}
      />
    </Tabs>
  );
}