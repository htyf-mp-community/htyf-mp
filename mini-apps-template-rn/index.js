import { AppRegistry } from 'react-native'
import { MiniAppsEnginesProvider } from '@htyf-mp/engines'
import { name as appName } from './app.json'
import App from './src'

const Root = () => {
  return <MiniAppsEnginesProvider>
    <App />
  </MiniAppsEnginesProvider>
}

AppRegistry.registerComponent(appName, () => Root)
