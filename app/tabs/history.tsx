import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, doc, deleteDoc, getDoc, updateDoc, increment, } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAuth } from 'firebase/auth';
import { format } from 'date-fns';
import { Menu, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

type Transaction = {
  id: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
};

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MMMM yyyy'));
  const [menuVisible, setMenuVisible] = useState(false);

  const router = useRouter();
  const user = getAuth().currentUser;

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'transactions'));
      const data: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, 'id'>),
      }));
  
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(data);
  
      const currentMonth = format(new Date(), 'MMMM yyyy');
      const allMonths = Array.from(new Set(data.map(tx => format(new Date(tx.date), 'MMMM yyyy'))));
      const filteredMonths = allMonths.filter(month => month !== currentMonth);
  
      setAvailableMonths(filteredMonths);
  
      setSelectedMonth(currentMonth);
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error);
    }
  };
  

  const deleteTransaction = async (transactionId: string, amount: number) => {
    if (!user) return;
  
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'users', user.uid, 'transactions', transactionId));
          setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
  
          
          await updateDoc(doc(db, 'users', user.uid), {
            totalSpent: increment(-amount),
          });
        },
      },
    ]);
  };
  
  
  

  const syncTransactions = async () => {
    const apiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (!user || !apiUrl) return;
  
    try {
      const res = await fetch(`${apiUrl}/api/sync_transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        if (data.count === 0) {
          alert('ℹ️ No new transactions available to sync.');
        } else {
        alert(` Synced ${data.count} transactions`);
        
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'transactions'));
        const fetched: Transaction[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Transaction, 'id'>),
        }));
  
        fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(fetched);
  
        const months = Array.from(new Set(fetched.map(tx => format(new Date(tx.date), 'MMMM yyyy'))));
        setAvailableMonths(months);
        setFilteredTransactions(fetched.filter(tx => format(new Date(tx.date), 'MMMM yyyy') === selectedMonth));
      }
      } else {
        alert('❌ Failed to sync transactions');
      }
    } catch (err) {
      console.error('❌ Error during sync:', err);
      alert('❌ Sync error occurred.');
    }
  };
  

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  useEffect(() => {
    const filtered = transactions.filter(tx =>
      format(new Date(tx.date), 'MMMM yyyy') === selectedMonth
    );
    setFilteredTransactions(filtered);
  }, [selectedMonth, transactions]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{selectedMonth} Transactions</Text>

      <Menu
  visible={menuVisible}
  onDismiss={() => setMenuVisible(false)}
  anchor={
    <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.dropdown}>
      Filter by Month
    </Button>
  }
>
  <Menu.Item
    key="current"
    onPress={() => {
      const current = format(new Date(), 'MMMM yyyy');
      setSelectedMonth(current);
      setMenuVisible(false);
    }}
    title="Current"
  />

  {availableMonths.map(month => (
    <Menu.Item
      key={month}
      onPress={() => {
        setSelectedMonth(month);
        setMenuVisible(false);
      }}
      title={month}
    />
  ))}
</Menu>


      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
              <Text style={styles.category}>{item.category}</Text>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.actions}>
              <Button
                compact
                mode="outlined"
                onPress={() => deleteTransaction(item.id, item.amount)}
              >
                Delete
              </Button>
              <Button
                compact
                mode="outlined"
                onPress={() => router.push({ pathname: '/screens/EditTransactionScreen', params: { id: item.id } })}
              >
                Edit
              </Button>
            </View>
          </View>
        )}
      />

      {user && (
        <>
          <Button
            mode="contained"
            style={styles.addButton}
            onPress={() =>
              router.push({ pathname: '/screens/AddTransactionScreen', params: { uid: user.uid } })
            }
          >
            Add Transaction
          </Button>

          <Button
            mode="contained"
            onPress={syncTransactions}
            style={[styles.addButton, { marginTop: 12 }]}
          >
            Sync Bank Transactions
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  dropdown: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  transactionCard: {
    backgroundColor: '#F4F6FA',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#006FFD',
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  addButton: {
    marginTop: 16,
    alignSelf: 'center',
    width: '90%',
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
});
