import React from 'react';
import LogoTitle from './src/components/LogoTitle';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import HomeScreen from './src/pages/HomeScreen';
import BleList from './src/components/BleListUpdated';


export default function App(){
  return (
    <View style={styles.sectionContainer}>
       <LogoTitle caption="Tiki Controller"/>
       <BleList/>
       {/* <HomeScreen/> */}
    </View>
  );
  }

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 50,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

