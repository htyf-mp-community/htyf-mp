import Taro from '@tarojs/taro';
import { View, Text, Button, Image } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { UIProvider, useAppSelector } from '@/_UIHOOKS_';
import './index.scss'

function Index() {
  const router = useRouter();
  const apps = useAppSelector(i => i.apps)
  return (
    <View className='page'>
      <Text>details: {JSON.stringify(router.params)}</Text>
      <Button
        onClick={() => {
          Taro.navigateBack()
        }}
      >
        返回
      </Button>
    </View>
  )
}

export default () => <UIProvider><Index/></UIProvider>