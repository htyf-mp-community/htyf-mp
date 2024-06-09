const isExpo = !!process.env.EXPO_DEV_SERVER_ORIGIN;

if (isExpo) {
  const {getDefaultConfig} = require('expo/metro-config');
  module.exports = getDefaultConfig(__dirname);
} else {
  const { mergeConfig } = require('metro-config')
  const { getMetroConfig } = require('@tarojs/rn-supporter')
  module.exports = (async function (){
    return mergeConfig({
    // custom your metro config here
    // https://facebook.github.io/metro/docs/configuration
      resolver: {}
    }, await getMetroConfig())
  })()
}