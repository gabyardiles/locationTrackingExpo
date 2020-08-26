import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LocationTracking  from './LocationTracking';

class App extends React.Component {
  
  render() {
    return (
      <LocationTracking/>
    )
  } 
};

export default App;