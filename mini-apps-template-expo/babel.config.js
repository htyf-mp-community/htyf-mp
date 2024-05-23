const dgz = require('./project.dgz.json')
const pkg = require('./package.json')

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'transform-define',
        {
          /**
           * appid
           */
          __APP_DEFINE_APPID__: `"${dgz.appid}"`,
          /**
           * app 版本号
           */
          __APP_DEFINE_VERSION__: `"${pkg.version}"`,
          /**
           * app 打包时间
           */
          __APP_DEFINE_BUILD_TIME__: `"${new Date().getTime()}"`,
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
