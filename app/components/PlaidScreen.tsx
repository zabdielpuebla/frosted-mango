import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { create, open, LinkSuccess, LinkExit } from 'react-native-plaid-link-sdk';
import Constants from 'expo-constants';
import { getAuth } from 'firebase/auth';

export default function PlaidScreen() {
  const [error, setError] = useState('');
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;



  




  const getTokenAndLaunchPlaid = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/create_link_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      console.log('✅ Received link_token:', data.link_token);

      await create({ token: data.link_token });

      open({
        onSuccess: async (success: LinkSuccess) => {
          console.log('🎉 Link success:', success);

          const auth = getAuth();
          const currentUser = auth.currentUser;

          if (!currentUser) return;

          const exchangeRes = await fetch(`${apiUrl}/api/exchange_public_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              public_token: success.publicToken,
              uid: currentUser.uid,
            }),
          });

          const exchangeData = await exchangeRes.json();
          console.log('🔁 Exchange complete:', exchangeData);
          if (exchangeData.success) {
            alert('✅ Bank account linked successfully!');
          } else {
            alert('Failed to save bank access.');
          }
        },
        onExit: (exit: LinkExit) => {
          console.log('🚪 Link exit:', exit);
        },
      });
    } catch (err: any) {
      console.error('❌ Error:', err.message);
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Link Bank Account" onPress={getTokenAndLaunchPlaid} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});
