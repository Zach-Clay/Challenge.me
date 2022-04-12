import React, {Component} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, AppRegistry} from 'react-native';
import { BrowserRouter, Link, Route } from "react-router-dom";

//Components
import Register from "./components/Register.js"; 
import Accessibility from './components/Accessibility.js';
import { render } from 'react-dom';

export default function App() {
  //const [view, setView] = useState("register");
  return (
    <View style={styles.container}>
      <Register />
      <Accessibility />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
