import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AddTransactionScreen() {
  const { uid } = useLocalSearchParams();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleAddTransaction = async () => {
    if (!uid || !amount || !category) {
      return alert('Please fill all fields');
    }

    const numericAmount = parseFloat(amount);

    try {
      const transactionRef = collection(db, 'users', uid, 'transactions');
      await addDoc(transactionRef, {
        amount: numericAmount,
        category,
        description,
        date: new Date().toISOString(),
      });

      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const prev = userDocSnap.data();
        await updateDoc(userDocRef, {
          totalSpent: (prev.totalSpent || 0) + numericAmount,
        });
      }

      alert('Transaction added!');
      setAmount('');
      setCategory('');
      setDescription('');

      setTimeout(() => {
        router.push({ pathname: '../tabs/budgethome', params: { uid } });
      }, 500);
    } catch (error) {
      console.error('❌ Failed to add transaction:', error);
      alert('Something went wrong');
    }
  };

  const handleCancel = () => {
    router.push({ pathname: '../tabs/budgethome', params: { uid } });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Food, Bills"
          />
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., McDonald’s lunch"
          />
          <Button mode="contained" onPress={handleAddTransaction} style={{ marginTop: 20 }}>
            Add Transaction
          </Button>
          <Button mode="text" onPress={handleCancel} style={{ marginTop: 10 }}>
            Cancel
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  card: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
});
