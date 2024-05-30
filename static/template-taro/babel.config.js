const pkg = require('./package.json');
const dgz = require('./project.dgz.json');

module.exports = function (api) {
  api.cache(true);
  let type = 'taro';
  let presets = [
    ['taro', {
      framework: 'react',
      ts: true
    }]
  ]
  let plugins = [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@': './src',
        },
      },
    ],
  ]
  if (process.env.EXPO_PUBLIC_PROJECT_ROOT) {
    type = 'expo'
    presets = ['babel-preset-expo'];
    plugins = [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './dgz/__source__/src',
          },
        },
      ],
    ]
  }
  return {
    presets: presets,
    plugins: [
      ...plugins,
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
      'react-native-reanimated/plugin',
    ]
  };
};
