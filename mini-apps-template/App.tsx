/** 禁止修改此块代码 */
import * as SplashScreen from 'expo-splash-screen';
import App from './src'
import { useCallback, useEffect } from 'react';
import { MiniAppsEnginesProvider, useMiniAppSdk } from '@htyf-mp/engines'
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
  const AppRoot = useCallback(() => {
    // @ts-ignore
    const sdk = global[`__GLOBAL_MINI_APP_SDK__`] = useMiniAppSdk();
    return  <App />
  }, [])
  return <GestureHandlerRootView>
    <SafeAreaProvider>
      <MiniAppsEnginesProvider>
        <AppRoot />
      </MiniAppsEnginesProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>;
}
/** 禁止修改此块代码 */