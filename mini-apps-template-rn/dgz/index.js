/**
 * @format
 */

import { AppRegistry } from 'react-native'
import {useEffect} from 'react'
import SplashScreen from 'react-native-splash-screen';
import App from './__source__/entry-file'
import { name as appName } from '../app.json'
import { MiniAppsEnginesProvider, miniAppSdk } from '@htyf-mp/engines'

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
