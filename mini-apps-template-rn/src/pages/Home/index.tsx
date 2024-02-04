import React from 'react';
import { Text, View } from 'react-native';
import { useAppSelector } from '@/_UIHOOKS_';

function App() {
  const apps = useAppSelector(i => i.apps)
  return <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  }}>
    <Text>红糖云服-小程序模板(RN)</Text>
    <Text>appid: {apps.__APPID__}</Text>
    <Text>version: {apps.__VERSION__}</Text>
    <Text>build time: {apps.__BUILD_TIME__}</Text>
  </View>;
}

export default App;
