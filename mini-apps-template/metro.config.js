const isExpo = !!process.env.EXPO_DEV_SERVER_ORIGIN;

const {getDefaultConfig} = require('expo/metro-config');
  module.exports = getDefaultConfig(__dirname);