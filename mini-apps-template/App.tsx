/** 禁止修改此块代码 */
import * as SplashScreen from 'expo-splash-screen';
import App from './src'
import { useCallback, useEffect, useRef, useState } from 'react';
import { SDKPortal } from '@htyf-mp/engines'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import pkg from './project.dgz.json'


// keep the splash screen visible while complete fetching resources
SplashScreen.preventAutoHideAsync();

export default function Root() {
  const skdRef = useRef();
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    SplashScreen.hideAsync();
    return () => {

    }
  }, [])
  const AppRoot = useCallback((props: {sdk: any}) => {
    // @ts-ignore
    global[`__DGZ_GLOBAL_CURRENT_MP_CLIENT__`] = props.sdk;
    return  <App />
  }, [])
  return <GestureHandlerRootView>
    <SafeAreaProvider>
      <>
        {
          (isReady && skdRef.current) ? <AppRoot sdk={skdRef.current} /> : null
        }
        <SDKPortal 
          appid={pkg.appid} 
          ref={skdRef} 
          launchOptions={{
            extraData: {}
          }}
          onReady={() => {
            setIsReady(true);
          }}
        />
      </>
    </SafeAreaProvider>
  </GestureHandlerRootView>;
}
/** 禁止修改此块代码 */