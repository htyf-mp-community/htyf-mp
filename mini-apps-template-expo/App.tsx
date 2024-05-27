/** 禁止修改些块代码 */
import * as SplashScreen from 'expo-splash-screen';
import App from './src'
import { useEffect } from 'react';
import {MiniAppsEnginesProvider} from '@htyf-mp/engines'


// keep the splash screen visible while complete fetching resources
SplashScreen.preventAutoHideAsync();

export default function Root() {
  useEffect(() => {
    SplashScreen.hideAsync();
    return () => {

    }
  }, [])
  return <MiniAppsEnginesProvider><App /></MiniAppsEnginesProvider>;
}
/** 禁止修改些块代码 */