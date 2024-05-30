import { View } from "@tarojs/components";
import './index.scss';

function AnimateWrap(props: {className?: string, children?: any}) {
  return <View className="uihooks-components-modal-animate-wrap">
     {props.children}
  </View>
}

export default AnimateWrap;