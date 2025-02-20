/** 禁止修改此块代码 */
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { SDKPortal } from '@htyf-mp/engines'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import App from './src'
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

  return <GestureHandlerRootView>
    <SafeAreaProvider>
      <React.Fragment>
        {
          (isReady && skdRef.current) ? <App /> : null
        }
        <SDKPortal 
          appid={pkg.appid} 
          launchOptions={{
            extraData: {}
          }}
          onReady={(sdk) => {
            // @ts-ignore
            global[`__DGZ_GLOBAL_CURRENT_MP_CLIENT__`] = skdRef.current = sdk;
            setIsReady(true);
          }}
        />
      </React.Fragment>
    </SafeAreaProvider>
  </GestureHandlerRootView>;
}
/** 禁止修改此块代码 */