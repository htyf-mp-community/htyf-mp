module.exports = {
  commands: require('@callstack/repack/commands'),
  assets: ['./node_modules/react-native-vector-icons/Fonts'],
  dependencies: {
    'react-native-google-cast': {
      platforms: {
        ios: null, // this will disable autolinking for this package on iOS
      },
    },
  },
};
