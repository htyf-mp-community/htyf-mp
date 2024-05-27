/** 禁止修改些块代码 */
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
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
}
/** 禁止修改些块代码 */
