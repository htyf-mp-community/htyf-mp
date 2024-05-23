import React from 'react';
import { Button, Image, Text, View } from 'react-native';
import { useAppSelector } from '@/_UIHOOKS_';
import jssdk from '@htyf-mp/js-sdk';
import pngIcon from '@/assets/icon.png'
import { useNavigation } from '@react-navigation/native';

function App() {
  const apps = useAppSelector(i => i.apps)
  const navigation = useNavigation();
  return <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  }}>
    <Text>11111红糖云服-小程序模板(RN)</Text>
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
    <Button
      title='进入详情页'
      onPress={() => {
        navigation.navigate('Details', {
          hello: '123'
        })
      }}
    />
    <View>
      <Text>Png icon</Text>
      <Image
        style={{
          width: 50,
          height: 50,
        }}
        source={pngIcon}
      />
    </View>
  </View>;
}

export default App;
