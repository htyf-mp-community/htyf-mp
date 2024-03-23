import { View, Text, Image, ScrollView, Button, Textarea, Input } from '@tarojs/components'
import Taro, { getEnv, useLoad, useRouter } from '@tarojs/taro'
import './index.scss'
import { UIProvider, useAppSelector } from '@/_UIHOOKS_';
import jssdk from '@htyf-mp/js-sdk';

function Index() {
  const apps = useAppSelector(i => i.apps)
  return (
    <View className='page'>
      <Text>红糖云服-小程序模板(Taro)</Text>
      <Text>appid: {apps.__APPID__}</Text>
      <Text>version: {apps.__VERSION__}</Text>
      <Text>build time: {apps.__BUILD_TIME__}</Text>
      <Button
        onClick={() => {
          jssdk.showToast({
            text1: '提示',
            text2: '这是个提示',
            type: '',
            position: 'top',
            autoHide: true,
          })
        }}
      >
        JSSDK-调用
      </Button>
    </View>
  )
}

export default () => <UIProvider><Index/></UIProvider>