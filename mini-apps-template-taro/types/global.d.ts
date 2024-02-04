/// <reference types="@tarojs/taro" />

declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd'
  }
}
/**
 * appid
 */
declare const __APP_DEFINE_APPID__: string;
/**
 * app 版本号
 */
declare const __APP_DEFINE_VERSION__: string;
/**
 * app 打包时间
 */
declare const __APP_DEFINE_BUILD_TIME__: string;