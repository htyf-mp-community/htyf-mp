import { View, Text, Button, Image } from '@tarojs/components'
import { UIProvider, useAppSelector } from '@/_UIHOOKS_';
import './index.scss'
import pngIcon from '@/assets/icon.png'
import Taro from '@tarojs/taro';
import routes from '@/routes';

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
          Taro.navigateTo({
            url: `${routes.pages.details}?hello=123`,
          })
        }}
      >
        进入详情页
      </Button>
      <View className="icon-wrap">
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