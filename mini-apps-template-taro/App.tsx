import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import {View, Text} from 'react-native'
import App from './dgz/__source__/entry-file'

// keep the splash screen visible while complete fetching resources
SplashScreen.preventAutoHideAsync();

export default function Root() {
  useEffect(() => {
    SplashScreen.hideAsync();
    return () => {

    }
  }, [])
  return <App />
  return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text>123</Text>
  </View>;
}
