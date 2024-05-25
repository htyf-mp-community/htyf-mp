import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';


// keep the splash screen visible while complete fetching resources
SplashScreen.preventAutoHideAsync();

export default function Root() {
  useEffect(() => {
    SplashScreen.hideAsync();
    return () => {

    }
  }, [])
  return <></>;
}
