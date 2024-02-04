import { AppRegistry } from 'react-native'
import SplashScreen from 'react-native-splash-screen';
import App from './src'
import { name as appName } from './app.json'
import { MiniAppsEnginesProvider, miniAppSdk } from '@hongtangyun/react-native-mini-apps-engines'
import { useEffect } from 'react';

const Root = () => {
  useEffect(() => {
    SplashScreen.hide();
    return () => {

    }
  }, [])
  return <MiniAppsEnginesProvider>
    <App minisdk={miniAppSdk} />
  </MiniAppsEnginesProvider>
}

AppRegistry.registerComponent(appName, () => Root)
