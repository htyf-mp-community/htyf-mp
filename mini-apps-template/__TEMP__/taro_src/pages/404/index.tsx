import { Button, View, Text } from '@tarojs/components'
import styles from './index.module.scss';
import { Header, UIProvider, navigate } from '@/_UIHOOKS_';

function Index() {
  return (
    <View className={styles['__404_wrap__']}>
      <Header title='404' />
      <View className={styles['__404_wrap_body_wrap__']}>
        <View className={styles['__404_wrap_body_wrap_404__']}>
          <View className={styles['__404_wrap_body_wrap_404_image_wrap__']}>
            {/* <Image className="__404_wrap_body_wrap_404_image__" src={icon} /> */}
          </View>
          <View>
            <Text className={styles["__404_wrap_body_wrap_404_text__"]}>糟糕，加载错误</Text>
          </View>
          <Button
            type="primary"
            onClick={() => {
              navigate.backToHome();
            }}
          >
            返回首页
          </Button>
        </View>
      </View>
    </View>
  )
}

export default () => <UIProvider><Index /></UIProvider>