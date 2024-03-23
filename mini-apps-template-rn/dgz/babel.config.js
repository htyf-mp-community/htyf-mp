const pkg = require('../package.json')
const dgz = require('../project.dgz.json')
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'transform-define',
      {
        __APP_DEFINE_APPID__: dgz.appid,
        __APP_DEFINE_VERSION__: pkg.version,
        __APP_DEFINE_BUILD_TIME__: new Date().getTime(),
      },
    ],
    'react-native-reanimated/plugin',
    'transform-remove-debugger',
    ['transform-remove-console', { exclude: ['error', 'warn'] }],
  ],
};
