import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { Image } from 'expo-image';
import Typography from './typography';



const HomeScreen = () => {
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[Typography.h1, styles.header]}>Welcome Back!</Text>
      <Text style={[Typography.h2, styles.subHeader]}>Here's a summary of your spending</Text>

      <View style={styles.chartSection}>
        <Text style={[Typography.h3, styles.sectionTitle]}>This Week’s Spend</Text>
        <Image
          source={require('./Images/Chart.svg')}
          style={styles.chart}
          contentFit="contain"
        />
      </View>

      <View style={styles.summarySection}>
        <View style={styles.card}>
          <Text style={Typography.h4}>Total Spent</Text>
          <Text style={styles.amount}>$212.40</Text>
        </View>
        <View style={styles.card}>
          <Text style={Typography.h4}>Remaining Budget</Text>
          <Text style={styles.amount}>$387.60</Text>
        </View>
      </View>

      <View >
 
</View>


      {/* Add more sections like "Recent Transactions" below if needed */}
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
  subHeader: {
    marginBottom: 32,
    textAlign: 'center',
  },
  chartSection: {
    width: '90%',
    marginBottom: 32,
  },
  chart: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
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

});

export default HomeScreen;
