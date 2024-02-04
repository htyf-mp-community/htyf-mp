import { View, Text, Image } from '@tarojs/components'
import classnames from 'classnames';
import './index.scss'
import AnimateWrap from './animate';

import { useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';

export type ToastProps = {
  open: boolean;
  mask?: boolean;
  wrapClassName?: string;
  className?: string;
  content?: string;
  afterClose?: () => void;
  onCancel?: () => void;
  onOk?: () => void;
}
export function Toast(props: ToastProps) {
  const { open, onOk, onCancel, } = props;
  // console.log(showPrompt());
  useEffect(() => {
    console.log(open)
    if (open) {
      Taro.hideTabBar({ animation: false })
    } else {
      Taro.showTabBar({ animation: false })
    }
    return () => {
      Taro.showTabBar({ animation: false })
    }
  }, [open])
  if (!open) {
    return undefined;
  }

  return (
    <View className={classnames('uihooks-components-toast-interview-container', props.wrapClassName)} style={{ display: open ? 'block' : 'none' }}>
      <View className='uihooks-components-toast-operation-box-wrap'>
        <AnimateWrap>
          <View className={classnames('uihooks-components-toast-operation-box', props.className)}>
           
          </View>
        </AnimateWrap>
      </View>
    </View>
  )
}

export default Toast