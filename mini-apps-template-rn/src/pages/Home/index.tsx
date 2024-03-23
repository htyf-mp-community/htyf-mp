import React from 'react';
import { Button, Text, View } from 'react-native';
import { useAppSelector } from '@/_UIHOOKS_';
import jssdk from '@htyf-mp/js-sdk';

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
    <Button
      title='JSSDK-调用'
      onPress={() => {
        jssdk.showToast({
          text1: '提示',
          text2: '这是个提示',
          type: '',
          position: 'top',
          autoHide: true,
        })
      }}
    />
  </View>;
}

export default App;
