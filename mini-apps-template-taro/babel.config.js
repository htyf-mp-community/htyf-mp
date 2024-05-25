const pkg = require('./package.json');
const dgz = require('./project.dgz.json');

// babel-preset-taro 更多选项和默认值：
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true
    }]
  ],
  plugins: [
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
}
