/** 禁止修改此块代码 */
import * as SplashScreen from 'expo-splash-screen';
import App from './src'
import { useEffect } from 'react';

// keep the splash screen visible while complete fetching resources
SplashScreen.preventAutoHideAsync();

export default function Root() {
  useEffect(() => {
    SplashScreen.hideAsync();
    return () => {

    }
  }, [])
  return <App />;
}
/** 禁止修改此块代码 */