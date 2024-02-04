import Taro from '@tarojs/taro';
import { View, Text, Image, StandardProps } from '@tarojs/components'
import { useState, useEffect, ReactNode, useMemo } from 'react';
import classnames from 'classnames';

import { entryPath } from '@/routes';

import { useNavigationBarInfo } from '../../utils';
import './index.scss'

import black from '../../assets/back_page.png';
import white from '../../assets/back_page2.png';

export interface Props extends StandardProps {
  title?: string,
  mode?: boolean,
  left?: Function | boolean;
  right?: ReactNode | boolean;
  backIcon?: 'black' | 'white'
  onBack?: () => void,
  titleStyle?: StandardProps['style']
}

export function Header(props: Props) {
  // title: 传入标题
  // mode: 是否为透明模式
  // backIcon: 返回按钮的样式
  const { title, mode, backIcon = 'black' } = props;
  const { navigationContentHeight, statusBarHeight } = useNavigationBarInfo();

  const [theBackIcon, setTheBackIcon] = useState(black);

  useEffect(() => {
    // 返回按钮样式处理
    if (backIcon === 'black') {
      setTheBackIcon(black);
    }
    if (backIcon === 'white') {
      setTheBackIcon(white);
    }
  }, [backIcon])

  const leftComponent = useMemo(() => {
    if (props.left === false) {
      return undefined;
    }
    if (typeof props.left === 'function') {
      return props.left()
    }
    return <View className={classnames('uihooks-components-header-left-back-btn')}
      onClick={() => {
        // 判断该值是否存在，亦是否为函数方法
        if (props.onBack && typeof props.onBack === 'function') {
          props.onBack()
        } else {
          Taro.navigateBack().catch(() => {
            Taro.reLaunch({
              url: entryPath
            })
          })
        }
      }}
    >
      {/* 黑色 */}
      <Image
        style={{ display: backIcon === 'black' ? 'flex' : 'none' }}
        className={classnames('uihooks-components-header-left-back-icon-black')}
        src={theBackIcon}
      />
      {/* 白色 */}
      <View
        style={{ display: backIcon === 'white' ? 'flex' : 'none' }}
        className='uihooks-components-header-left-back-icon-white-wrap'
      >
        <Image
          className={classnames('uihooks-components-header-left-back-icon-white')}
          src={theBackIcon}
        />
      </View>
    </View>;
  }, [props])

  return <View
    {...props}
    style={props.style}
    className={classnames('uihooks-components-header-wrap', props.className)}
  >
    <View
      style={{
        flexShrink: 0,
        width: '100%',
        height: statusBarHeight || 0,
      }}
    />
    <View
      className={classnames('uihooks-components-header-body')}
      style={navigationContentHeight ? {
        height: navigationContentHeight
      } : {}}
    >
      <View className={classnames('uihooks-components-header-body-left')}>
        {
          leftComponent
        }
      </View>
      {/* 标题内容容器 */}
      <View className={classnames('uihooks-components-header-body-center')}>
        <Text
          style={props.titleStyle}
          numberOfLines={1}
          className={classnames('uihooks-components-header-body-center-title')}
        >{title}</Text>
      </View>
      <View className={classnames('uihooks-components-header-body-right')}>

      </View>
    </View>
  </View>
}

export default Header;
