const moment = require('dayjs');

module.exports = api => {
  const babelEnv = api.env();
  api.cache(false);
  const time = moment().format('YYYY/MM/DD HH:mm:ss');
  const plugins = [
    'react-native-reanimated/plugin',
    [
      'babel-plugin-inline-import',
      {
        extensions: ['.svg'],
      },
    ],
    ['transform-inline-environment-variables'],
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@': './src',
        },
      },
    ],
  ];
  //change to 'production' to check if this is working in 'development' mode
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-debugger']);
  }
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console', {exclude: ['error', 'warn']}]);
  }
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: plugins,
    comments: true,
  };
};
