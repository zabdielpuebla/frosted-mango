import * as react from 'react';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Typography from './typography';
import { Image } from 'expo-image';
import { useWindowDimensions } from 'react-native';

const NewScreen = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', 
      alignContent: 'flex-start', paddingTop: 84, backgroundColor: '#ffffff',}}>
        <Text style={[Typography.h1, {marginBottom: 24}]}>This Week's Spend</Text>
        <View style={{flexDirection: 'column', justifyContent: 'space-between', width: '55%', paddingHorizontal: 20, marginBottom: 24}}>
          <Image source={require('./Images/Chart.svg')} style={{width: '100%', height: 300, borderRadius: 8, marginBottom: 12}} />
        </View>

      </View>
    );
  };
  
  export default NewScreen;