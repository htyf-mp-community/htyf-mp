import { View, Text, Image, ScrollView, Button, Textarea, Input } from '@tarojs/components'
import Taro, { getEnv, useLoad, useRouter } from '@tarojs/taro'
import './index.scss'
import { UIProvider, useAppSelector } from '@/_UIHOOKS_';

function Index() {
  const apps = useAppSelector(i => i.apps)
  return (
    <View className='page'>
      <Text>红糖云服-小程序模板(Taro)</Text>
      <Text>appid: {apps.__APPID__}</Text>
      <Text>version: {apps.__VERSION__}</Text>
      <Text>build time: {apps.__BUILD_TIME__}</Text>
    </View>
  )
}

export default () => <UIProvider><Index/></UIProvider>