/** 非必要禁止修改此块代码 */
const dgz = require('./project.dgz.json')
const pkg = require('./package.json')

module.exports = function (api) {
  api.cache(true);
  let type = 'htyf-mp';
  let presets = ['module:metro-react-native-babel-preset'];
  if (process.env.EXPO_PUBLIC_PROJECT_ROOT) {
    presets = ['babel-preset-expo'];
    type = 'expo';
  }
  console.log('run', type)
  return {
    presets: presets,
    plugins: [
      'react-native-reanimated/plugin',
      [
        'transform-define',
        {
          /**
           * appid
           */
          __APP_DEFINE_APPID__: `${dgz.appid}`,
          /**
           * app 版本号
           */
          __APP_DEFINE_VERSION__: `${pkg.version}`,
          /**
           * app 打包时间
           */
          __APP_DEFINE_BUILD_TIME__: `${new Date().getTime()}`,
        },
      ],
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
