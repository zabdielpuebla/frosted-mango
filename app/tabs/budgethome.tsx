import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Menu } from "react-native-paper";
import { PieChart } from 'react-native-chart-kit';
import Typography from '../utils/typography';

import { doc, getDoc, onSnapshot, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { parseISO, isSameMonth, format } from 'date-fns';



import PlaidScreen from '../components/PlaidScreen';

interface Summary {
  id: string;
  month: string;
  year: number;
  budget: number;
  totalSpent: number;
  remainingBudget: number;
  savedAt: string;
}

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const { uid } = useLocalSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [justReset, setJustReset] = useState(false);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [plaidLinked, setPlaidLinked] = useState(false);
  const [unlinkedNotice, setUnlinkedNotice] = useState(false);

  const fetchPlaidStatus = async () => {
    if (!uid) return;
    const userRef = doc(db, 'users', uid as string);
    const userSnap = await getDoc(userRef);
    const plaidData = userSnap.data()?.plaid;
    setPlaidLinked(!!plaidData?.access_token);
  };

  useEffect(() => {
    fetchPlaidStatus();
  }, [uid]);

  // listen for Plaid status
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'users', uid as string), (snap) => {
      const data = snap.data();
      setPlaidLinked(!!data?.plaid?.access_token);
    });
    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const userRef = doc(db, "users", uid as string);
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      const lastReset = data.lastReset ? parseISO(data.lastReset) : null;
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const isLastDayOfMonth = tomorrow.getDate() === 1;
      const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      if (isLastDayOfMonth) {
        const summaryRef = doc(db, `users/${uid}/monthlySummaries/${monthKey}`);
        const summarySnap = await getDoc(summaryRef);
        if (!summarySnap.exists()) {
          const transRef = collection(db, `users/${uid}/transactions`);
          const transSnap = await getDocs(transRef);
          const categorized: Record<string, number> = {};
          transSnap.forEach(doc => {
            const { category, amount } = doc.data();
            if (category && amount) {
              categorized[category] = (categorized[category] || 0) + amount;
            }
          });
          const colors = ['#f39c12', '#e74c3c', '#8e44ad', '#2980b9', '#27ae60', '#16a085'];
          const chartSnapshot = Object.entries(categorized).map(([name, amount], i) => ({ name, amount, color: colors[i % colors.length] }));
          await setDoc(summaryRef, {
            month: format(today, 'MMMM'),
            year: today.getFullYear(),
            budget: data.budget || 0,
            totalSpent: data.totalSpent || 0,
            remainingBudget: (data.budget || 0) - (data.totalSpent || 0),
            chart: chartSnapshot,
            savedAt: today.toISOString(),
          });
        }
      }

      if (!lastReset || !isSameMonth(today, lastReset)) {
        await updateDoc(userRef, {
          totalSpent: 0,
          lastReset: today.toISOString(),
        });
        setUserData({ ...data, totalSpent: 0 });
        setJustReset(true);
        setTimeout(() => setJustReset(false), 5000);
      } else {
        setUserData(data);
        setJustReset(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user data:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    const fetchSummaries = async () => {
      if (!uid) return;
      const summariesRef = collection(db, `users/${uid}/monthlySummaries`);
      const snapshot = await getDocs(summariesRef);
      const summaryList: Summary[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          month: data.month,
          year: data.year,
          budget: data.budget,
          totalSpent: data.totalSpent,
          remainingBudget: data.remainingBudget,
          savedAt: data.savedAt,
        };
      });
      summaryList.sort((a, b) => (a.savedAt > b.savedAt ? -1 : 1));
      setSummaries(summaryList);
    };
    fetchSummaries();
  }, [uid]);

  //listen for transactions
  useEffect(() => {
    if (!uid) return;
    const ref = collection(db, `users/${uid}/transactions`);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const categorized: Record<string, number> = {};
      snapshot.forEach(doc => {
        const { category, amount } = doc.data();
        if (category && amount) {
          categorized[category] = (categorized[category] || 0) + amount;
        }
      });
      const colors = ['#f39c12', '#e74c3c', '#8e44ad', '#2980b9', '#27ae60', '#16a085'];
      const formatted = Object.entries(categorized).map(([name, amount], i) => ({
        name, amount, color: colors[i % colors.length], legendFontColor: '#333', legendFontSize: 14,
      }));
      setChartData(formatted);
    });
    return () => unsubscribe();
  }, [uid]);

  const handleUnlink = () => {
    Alert.alert(
      'Unlink Bank Account?',
      'Are you sure you want to unlink your bank account? You will have to link it again to sync transactions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          onPress: async () => {
            try {
              const userRef = doc(db, 'users', uid as string);
              await updateDoc(userRef, { plaid: {} });
              setPlaidLinked(false);
              Alert.alert(
                '🔓 Bank Account Unlinked',
                'Bank account unlinked. No new transactions will be synced. Existing data is retained.',
                [{ text: 'OK' }]
              );
            } catch (err) {
              console.error('❌ Error unlinking bank:', err);
              Alert.alert('Error', 'Failed to unlink your bank account.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#006FFD" />
        <Text style={Typography.h2}>Loading your budget info...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[Typography.h2, styles.header]}>Here's a summary of your {format(new Date(), 'MMMM')} spending</Text>

      {justReset && (
        <View style={{ backgroundColor: '#E0F7FA', padding: 10, marginBottom: 16, borderRadius: 8 }}>
          <Text style={{ textAlign: 'center', color: '#00796B', fontWeight: '600' }}>✨ Your monthly budget has been reset!</Text>
        </View>
      )}

      {unlinkedNotice && (
        <View style={{ backgroundColor: '#FFF3CD', padding: 10, marginBottom: 16, borderRadius: 8 }}>
          <Text style={{ textAlign: 'center', color: '#856404', fontWeight: '600' }}>
            ⚠️ Bank account unlinked. No new transactions will be synced. Existing data is retained.
          </Text>
        </View>
      )}

<View style={{ width: '90%', alignSelf: 'center', marginBottom: 12 }}>
  <Menu
    visible={menuVisible}
    onDismiss={() => setMenuVisible(false)}
    anchor={
      <Button mode="outlined" onPress={() => setMenuVisible(true)}>
        {selectedSummary ? `${selectedSummary.month} ${selectedSummary.year}` : 'Select Month'}
      </Button>
    }
  >
    <Menu.Item
      key="current"
      onPress={() => {
        setSelectedMonthKey('');
        setSelectedSummary(null);
        setMenuVisible(false);
      }}
      title="Current Month (Live)"
    />
    {summaries.map((summary) => (
      <Menu.Item
        key={summary.id}
        onPress={() => {
          setSelectedMonthKey(summary.id);
          setSelectedSummary(summary);
          setMenuVisible(false);
        }}
        title={`${summary.month} ${summary.year}`}
      />
    ))}
  </Menu>
</View>


      <View style={styles.chartSection}>
        <Text style={[Typography.h3, styles.sectionTitle]}>{selectedSummary ? `${selectedSummary.month} ${selectedSummary.year} Spend` : "This Month’s Spend"}</Text>
        {selectedSummary && selectedSummary.chart ? (
          <PieChart
            data={selectedSummary.chart.map((entry: any, i: number) => ({ ...entry, legendFontColor: '#333', legendFontSize: 14 }))}
            width={screenWidth * 0.9}
            height={220}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            chartConfig={{ backgroundColor: "#fff", backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff", color: (opacity = 1) => `rgba(0, 111, 253, ${opacity})` }}
            style={{ borderRadius: 16 }}
          />
        ) : chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth * 0.9}
            height={220}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            chartConfig={{ backgroundColor: "#fff", backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff", color: (opacity = 1) => `rgba(0, 111, 253, ${opacity})` }}
            style={{ borderRadius: 16 }}
          />
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No transaction data to display yet.</Text>
        )}
      </View>

      <View style={{ marginTop: 16 }}>
        {!plaidLinked ? (
          <PlaidScreen />
        ) : (
          <Button mode="outlined" onPress={handleUnlink}>Unlink Bank Account</Button>
        )}
      </View>

      <View style={styles.topCardSection}>
        <View style={styles.cardFullWidth}>
          <Text style={Typography.h4}>Initial Budget</Text>
          <Text style={styles.amount}>${selectedSummary?.budget?.toFixed(2) ?? userData?.budget?.toFixed(2) ?? '0.00'}</Text>
          {!selectedSummary && <TouchableOpacity onPress={() => router.push({ pathname: '/screens/SetBudgetScreen', params: { uid } })}><Text style={styles.linkText}>Set Budget</Text></TouchableOpacity>}
        </View>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.card}>
          <Text style={Typography.h4}>Total Spent</Text>
          <Text style={styles.amount}>${selectedSummary?.totalSpent?.toFixed(2) ?? userData?.totalSpent?.toFixed(2) ?? '0.00'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={Typography.h4}>Remaining Budget</Text>
          <Text style={styles.amount}>${selectedSummary ? selectedSummary.remainingBudget?.toFixed(2) : userData?.budget ? (userData.budget - userData.totalSpent).toFixed(2) : '0.00'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 84,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 12,
    textAlign: 'center',
  },
  chartSection: {
    width: '90%',
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  summarySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '90%',
    rowGap: 12,
  },
  card: {
    backgroundColor: '#F4F6FA',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#006FFD',
    marginTop: 8,
  },
  topCardSection: {
    width: '90%',
    marginBottom: 16,
  },
  cardFullWidth: {
    backgroundColor: '#F4F6FA',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkText: {
    color: '#006FFD',
    marginTop: 8,
    textAlign: 'left',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
