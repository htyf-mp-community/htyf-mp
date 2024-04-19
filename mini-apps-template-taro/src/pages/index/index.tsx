import { View, Text, Button, Image } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { UIProvider, useAppSelector } from '@/_UIHOOKS_';
import jssdk from '@htyf-mp/js-sdk';
import './index.scss'
import pngIcon from '@/assets/icon.png'
import Taro from '@tarojs/taro';
import routes from '@/routes';

function Index() {
  const router = useRouter();
  const apps = useAppSelector(i => i.apps)
  return (
    <View className='page'>
      <Text>红糖云服-小程序模板(Taro) {router.path}</Text>
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
      <Button
        onClick={() => {
          Taro.navigateTo({
            url: `${routes.pages.details}?hello=123`,
          })
        }}
      >
        进入详情页
      </Button>
      <View>
        <Text>Png icon</Text>
        <Image
          style={{
            width: 50,
            height: 50,
          }}
          src={pngIcon}
        />
      </View>
    </View>
  )
}

export default () => <UIProvider><Index/></UIProvider>