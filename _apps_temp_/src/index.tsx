import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Navigation } from './navigation';


function App() {
  const colorScheme = useColorScheme();

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme

  return (
    <Navigation
      theme={theme}
      onReady={() => {
       
      }}
    />
  );
}

export default App;