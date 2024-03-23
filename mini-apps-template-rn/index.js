import { AppRegistry } from 'react-native'
import App from './src'
import { name as appName } from './app.json'
import { MiniAppsEnginesProvider } from '@htyf-mp/engines'

const Root = () => {
  return <MiniAppsEnginesProvider>
    <App />
  </MiniAppsEnginesProvider>
}

AppRegistry.registerComponent(appName, () => Root)
