import { View, Text, Image } from '@tarojs/components'
import classnames from 'classnames';
import './index.scss'
import AnimateWrap from './animate';

import { useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';

import alertDefaultBg from '../../assets/alert_info_bg.png';
import alertErrorBg from '../../assets/alert_error_bg.png';
import alertTheme3 from '../../assets/alert_theme_3.png';
import alertTheme3IconBg from '../../assets/theme_3_icon_bg.png';
import iconImg from '../../assets/icon.png';

export type ModalProps = {
  open: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  theme?: 'theme1' | 'theme2' | 'theme3',
  type?: 'info' | 'success' | 'error' | 'warning' | 'confirm',
  icon?: boolean | string;
  wrapClassName?: string;
  className?: string;
  title?: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  afterClose?: () => void;
  onCancel?: () => void;
  onOk?: () => void;
}
export function Modal(props: ModalProps) {
  const { icon = false, open, mask = true, onOk, onCancel, type, maskClosable = false, theme = 'theme1' } = props;
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

  const styleOpt = useMemo(() => {
    let bgImg = alertDefaultBg;
    let btnColor = '#4172f5';
    let btnTextColor = '#fff';
    if (props.theme === 'theme1') {
      bgImg = alertDefaultBg;
      btnColor = '#4172f5';
      btnTextColor = '#4172f5';
      btnTextColor = '#fff';
    }
    if (props.theme === 'theme2') {
      bgImg = alertErrorBg;
      btnColor = '#FF6B3A';
      btnTextColor = '#fff';
    }
    if (props.theme === 'theme3') {
      bgImg = alertTheme3;
      btnColor = '#CDFFBE';
      btnTextColor = '#2C3554';
    }
    return {
      bgImg,
      btnColor,
      btnTextColor,
    }
  }, [props])

  return (
    <View className={classnames('uihooks-components-modal-interview-container', props.wrapClassName)} style={{ display: open ? 'block' : 'none' }}>
      {/* 可关闭背景 */}
      {mask === false ? undefined : <View
        className='uihooks-components-modal-interview-bg'
        onClick={() => {
          if (maskClosable === true) {
            onCancel && onCancel();
          }
        }}
      />}
      <View className='uihooks-components-modal-operation-box-wrap'>
        <AnimateWrap>
          <View className={classnames('uihooks-components-modal-operation-box', props.className)}>
            <Image className='uihooks-components-modal-operation-bg' src={styleOpt.bgImg} />
            {theme === 'theme3' ? <View className='uihooks-components-modal-operation-box-content-theme3-icon-wrap'>
              <View className='uihooks-components-modal-operation-box-content-theme3-icon-content'>
                <Image src={alertTheme3IconBg} className='uihooks-components-modal-operation-box-content-theme3-icon-content-bg' />
                {`${icon}` ? <Image src={`${icon}`} className='uihooks-components-modal-operation-box-content-theme3-icon-content-icon' /> : undefined}
              </View>
            </View> : undefined}
            <View className='uihooks-components-modal-operation-box-content'>
              {icon === true ? <View className='uihooks-components-modal-operation-box-content-icon-wrap'> <Image className='uihooks-components-modal-operation-box-content_icon_img' src={iconImg} /> </View> : undefined}
              {props.title ? <View className='uihooks-components-modal-operation-title'><Text numberOfLines={1} className='uihooks-components-modal-operation-title-text'>{props.title || '提示'}</Text></View> : undefined}
              <View className='uihooks-components-modal-operation-disc'>
                <Text className='uihooks-components-modal-operation-disc-text'>
                  {props.content || ''}
                </Text>
              </View>
              <View className='footer-wrap'>
                {type === 'confirm' ? <View className='uihooks-components-modal-operation-config-btn on-cancel' onClick={onCancel}><Text className='uihooks-components-modal-operation-config-btn-text'>取消</Text></View> : undefined}
                <View
                  style={{ backgroundColor: styleOpt.btnColor, color: styleOpt.btnTextColor }}
                  className={classnames('uihooks-components-modal-operation-config-btn')}
                  onClick={onOk}
                >
                  <Text className='uihooks-components-modal-operation-config-btn-text'>确定</Text>
                </View>
              </View>
            </View>
          </View>
        </AnimateWrap>
      </View>
    </View>
  )
}

export default Modal