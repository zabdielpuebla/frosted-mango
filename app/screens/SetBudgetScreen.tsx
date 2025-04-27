import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { db } from '../lib/firebase';
import { useRouter } from 'expo-router';

export default function SetBudgetScreen() {
  const [budget, setBudget] = useState('');
  const router = useRouter();

  const handleSaveBudget = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to set a budget.');
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid), {
        budget: parseFloat(budget),
      }, { merge: true });

      Alert.alert('Success', 'Budget saved!');
    router.push({ pathname: '../tabs/budgethome', params: { uid: user.uid } });
    } catch (error) {
      console.error('❌ Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    }
  };

  const handlecancel = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to set a budget.');
      return;
    }

    
     
    router.push({ pathname: '../tabs/budgethome', params: { uid: user.uid } });
  
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set Your Monthly Budget</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={budget}
        onChangeText={setBudget}
      />
      <Button title="Save Budget" onPress={handleSaveBudget} />
      <Button title="Cancel" onPress={handlecancel}/>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 18,
  },
});
