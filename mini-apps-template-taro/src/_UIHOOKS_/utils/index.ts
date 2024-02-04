import { BaseEventOrig, ScrollViewProps } from '@tarojs/components';
import Taro from '@tarojs/taro'
import { useCallback } from 'react';

export * from './navigate';

// 安全区的计算判断
export const safeArea = () => {
  // 使用TaroJs获取当前开发环境
  const env = Taro.getEnv();
  // 初始化安全区域数值
  // eslint-disable-next-line @typescript-eslint/no-shadow
  let safeArea = { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0 };
  try {
    // 环境满足（微信小程序、抖音小程序、WEB(H5)、ReactNative）其中之一即可
    if (env === 'WEAPP' || env === 'TT' || env === 'WEB' || env === 'RN') {
      const systemInfoSync = Taro?.getSystemInfoSync();
      // 同步获取当前环境系统相关信息
      const safeAreaInfo: any = systemInfoSync?.safeArea || {};
      const screenHeight = systemInfoSync.screenHeight;
      const screenWidth = systemInfoSync.screenWidth;
      // 设置安全区域数值
      safeArea = {
        bottom: safeAreaInfo?.bottom > safeAreaInfo?.height ? screenHeight - safeAreaInfo?.bottom : safeAreaInfo?.bottom,
        height: safeAreaInfo?.height || 0,
        left: safeAreaInfo?.left || 0,
        right: safeAreaInfo?.right || 0,
        top: safeAreaInfo?.top || 0,
        width: safeAreaInfo?.width || 0,
      }
    }
  } catch (error) {

  }
  console.log('safeArea', safeArea)
  // 若在ReactNative中，则用使用设置的安全区域数值直接布局，其余环境则使用获取的安全区域数值rpx进行相对布局
  return {
    bottom: env === 'RN' ? safeArea.bottom : (safeArea.bottom > 0 ? safeArea.bottom : 0),
    height: env === 'RN' ? safeArea.height : (safeArea.height > 0 ? safeArea.height : 0),
    left: env === 'RN' ? safeArea.left : (safeArea.left > 0 ? safeArea.left : 0),
    right: env === 'RN' ? safeArea.right : (safeArea.right > 0 ? safeArea.right : 0),
    top: env === 'RN' ? safeArea.top : (safeArea.top > 0 ? safeArea.top : 0),
    width: env === 'RN' ? safeArea.width : (safeArea.width > 0 ? safeArea.width : 0),
  }
}

// 获取菜单栏胶囊相关数值
export const menuButtonRect = () => {
  const env = Taro.getEnv();
  let info = {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
  }
  try {
    if (env === 'WEAPP' || env === 'TT') {
      // 获取菜单按钮（右上角胶囊按钮）的布局位置信息
      const _info = Taro?.getMenuButtonBoundingClientRect?.();
      // 比较初始化值并且判断赋值嵌入
      info = {
        bottom: _info?.bottom || 0,
        height: _info?.height || 0,
        left: _info?.left || 0,
        right: _info?.right || 0,
        top: _info?.top || 0,
        width: _info?.width || 0,
      }
    }
    // ReactNative进行相关计算
    if (env === 'RN') {
      info = {
        bottom: Number(safeArea().height) - 34 - 14,
        height: 34,
        left: Number(safeArea().width) - 88 - 14,
        right: Number(safeArea().top) + 7,
        top: Number(safeArea().top) + 7,
        width: 88,
      }
    }
  } catch (error) {

  }
  // ReactNative直接布局，其余使用px进行绝对布局
  return {
    bottom: env === 'RN' ? info.bottom : (info.bottom > 0 ? info.bottom : 0),
    height: env === 'RN' ? info.height : (info.height > 0 ? info.height : 0),
    left: env === 'RN' ? info.left : (info.left > 0 ? info.left : 0),
    right: env === 'RN' ? info.right : (info.right > 0 ? info.right : 0),
    top: env === 'RN' ? info.top : (info.top > 0 ? info.top : 0),
    width: env === 'RN' ? info.width : (info.width > 0 ? info.width : 0),
  }
}

interface UseNavigationBarInfoPresets {
  menuButtonInfo: Taro.getMenuButtonBoundingClientRect.Rect
  systemInfo: Taro.getSystemInfoSync.Result
}

interface INavigationBarInfo {
  navigationBarHeight: number
  navigationContentHeight: number
  menuButtonHeight: number
  navigationPaddding: number
  menuButtonWidth: number
  statusBarHeight: number
}

/**
 * 获取导航栏相关信息
 */
export const useNavigationBarInfo = (
  presets: UseNavigationBarInfoPresets = {} as any
): INavigationBarInfo => {
  const systemMenuButtonInfo = menuButtonRect();
  const menuButtonInfo = presets.menuButtonInfo || systemMenuButtonInfo
  const systemInfo = presets.systemInfo || Taro.getSystemInfoSync()
  let { statusBarHeight = 0 } = systemInfo
  if (Number.isNaN(statusBarHeight)) {
    statusBarHeight = 0;
  }
  let navigationContentHeight = 40
  navigationContentHeight =
    (menuButtonInfo.top - statusBarHeight) * 2 +
    menuButtonInfo.height
  if (navigationContentHeight <= 0) {
    navigationContentHeight = 40
  }
  return {
    navigationBarHeight: statusBarHeight + navigationContentHeight,
    navigationContentHeight,
    menuButtonHeight: menuButtonInfo.height,
    navigationPaddding: systemInfo.windowWidth - menuButtonInfo.right,
    statusBarHeight: statusBarHeight,
    menuButtonWidth: menuButtonInfo.width,
  }
}

// 在不同客户端，计算滚动栏顶部滚动后与其顶部的距离
export const useOnScrollTopNumFun = (): (e: BaseEventOrig<ScrollViewProps.onScrollDetail>) => number => {
  // “number”仅表示类型，但在此处却作为值使用
  // console.log(number)
  return (e): number => {
    // console.log(e);

    // 设私有变量为 0
    let _scrollTop = 0;
    const env = Taro.getEnv();

    // onScroll 中含有 detail 和 _scrollTop 属性。
    // onScrollEnd 中没有 detail 属性，通过 _scrollTop 来获取距离。

    // _scrollTop 的滚动步长为固定整数，detail.scrollTop 为精准的实际滚动距离
    if (env === 'WEB') {
      // @ts-ignore
      if (e?.target?._scrollTop) {
        // @ts-ignore
        _scrollTop = e?.target?._scrollTop;
      }
    }
    if (env === 'WEAPP') {

    }
    if (env === 'RN') {

    }
    if (e?.detail?.scrollTop) {
      _scrollTop = e?.detail?.scrollTop
    }
    // 小数点截取
    return Number(_scrollTop.toFixed(0))
  }
}

/**
 * 设置统一样式前缀
 * @param prefixCls
 * @returns
 */
export const usePagePrefixCls = (prefixCls: string) => {
  return useCallback((classname: string) => {
    return `${prefixCls}${classname}`
  }, [])
}
