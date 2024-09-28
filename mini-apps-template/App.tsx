/** 禁止修改此块代码 */
import * as SplashScreen from 'expo-splash-screen';
import App from './src'
import { useEffect } from 'react';
import {MiniAppsEnginesProvider} from '@htyf-mp/engines'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


// keep the splash screen visible while complete fetching resources
SplashScreen.preventAutoHideAsync();

export default function Root() {
  useEffect(() => {
    SplashScreen.hideAsync();
    return () => {

    }
  }, [])
  return <GestureHandlerRootView>
    <SafeAreaProvider><MiniAppsEnginesProvider><App /></MiniAppsEnginesProvider></SafeAreaProvider>
  </GestureHandlerRootView>;
}
/** 禁止修改此块代码 */