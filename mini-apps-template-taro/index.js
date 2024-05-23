import App from '@tarojs/rn-supporter/entry-file.js'
import { AppRegistry, View, Text } from 'react-native'
import { name as appName } from './app.json'

const Root = () => {
  return <App />
}

AppRegistry.registerComponent(appName, () => Root)
