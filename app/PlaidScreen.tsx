import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { create, open, LinkSuccess, LinkExit } from 'react-native-plaid-link-sdk';


import Constants from 'expo-constants';

export default function PlaidScreen() {
  const [error, setError] = useState('');
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;
  const getTokenAndLaunchPlaid = async () => {
    try {
      /*const res = await fetch('http://10.0.0.29:5005/api/create_link_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });*/
      

const res = await fetch(`${apiUrl}/api/create_link_token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});











      const data = await res.json();
      console.log('✅ Received link_token:', data.link_token);

      // 👇 AWAIT create
      await create({ token: data.link_token });

      // 👇 THEN open Plaid Link
      open({
        onSuccess: (success: LinkSuccess) => {
          console.log('🎉 Link success:', success);
        },
        onExit: (exit: LinkExit) => {
          console.log('🚪 Link exit:', exit);
        },
      });
    } catch (err: any) {
      console.error('❌ Error fetching token or launching Link:', err.message);
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Link Bank Account" onPress={getTokenAndLaunchPlaid} />
      {error && <Text style={[styles.text, { color: 'red' }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
  },
});
