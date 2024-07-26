const path = require('path')

const config = {
  projectName: 'mini-apps-template',
  date: '2023-4-23',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [
      { from: 'assets/', to: 'dist' },
      // { from: 'dgz/build/outputs/app.json', to: 'dist/' },
      // { from: 'dgz/build/outputs/dist.zip', to: 'dist/' },
    ],
    options: {
    }
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    // https://github.com/NervJS/taro/issues/13271
    prebundle: {
      enable: false,
    },
  },
  cache: {
    enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'assets',
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          maxRootSize: 30,
        },
      },
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    // fix https://github.com/NervJS/taro/issues/13674
    webpackChain(chain, webpack) {
      chain.merge({
        module: {
          rule: {
            myloader: {
              test: /\.js$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {},
                },
              ],
            },
          },
        },
      });
    },
  },
  rn: {
    appName: 'apps',
    postcss: {
      cssModules: {
        url: {
          enable: true,
          config: {
            limit: 1024 * 1000 // 设定转换尺寸上限
          }
        },
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
