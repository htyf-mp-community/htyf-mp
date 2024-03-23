import path from 'path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import TerserPlugin from 'terser-webpack-plugin'
import WebpackObfuscator from 'webpack-obfuscator';
import * as Repack from '@callstack/repack'
import fse from 'fs-extra';
import webpack from 'webpack'
import md5 from 'md5'
import dayjs from 'dayjs'
import crypto from 'crypto'
import { rimrafSync } from 'rimraf'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const webcrypto = crypto.webcrypto;
const uuid = webcrypto.randomUUID();
console.log(__dirname)
const projectConfig = fse.readJsonSync(path.join(__dirname, '../project.dgz.json'))
const pkgPath = path.join(__dirname, '../package.json')
const entryPath = path.join(__dirname, './index.js')
const exposesPath = path.join(__dirname, './__source__/entry-file.js');
const node_modulesPath = path.join(__dirname, '../node_modules')
const tsconfig = fse.readJSONSync(path.join(__dirname, '../tsconfig.json'), 'utf-8')

const pkg = fse.readJSONSync(pkgPath)
let appSharedObj = fse.readJSONSync(path.join(node_modulesPath, '@htyf-mp/engines/shared.json'))
let sharedObj = {}

for (const key in appSharedObj) {
  const p = appSharedObj[key]
  if (
    key === '@wuba/react-native-echarts' ||
    key === 'taro-charts' ||
    key === 'redux-saga' ||
    key === 'react-redux' ||
    key === '@reduxjs/toolkit' || 
    key === 'immer'
  ) {
    
  } else {
    sharedObj[key] = {
      /** 是否运行为单例 */
      singleton: true,
      /** 是否不拆包 === host 必须为true */
      eager: true,
      requiredVersion: p.replace(/\^/gi, '')
    }
  }
}

export default env => {
  const {
    dgzenv = '',
    mode = 'development',
    context = Repack.getDirname(import.meta.url),
    entry = entryPath,
    platform = process.env.PLATFORM,
    minimize = mode === 'production',
    devServer = undefined,
    bundleFilename = undefined,
    sourceMapFilename = undefined,
    assetsPath = undefined,
    reactNativePath = new URL(`${node_modulesPath}/react-native`, import.meta.url)
      .pathname,
  } = env
  const dirname = Repack.getDirname(import.meta.url)

  const appid = `${projectConfig.appid}${dgzenv ? `__${dgzenv}__` : ''}`
  const version = `${pkg.version}${dgzenv ? `.${Date.now()}` : ''}`

  console.log('bundleFilename', bundleFilename)
  if (!platform) {
    throw new Error('Missing platform')
  }

  const _alias_ = {
    ...(tsconfig.compilerOptions.paths || {})
  }

  const babelOptions = {
    configFile: path.join(__dirname, './babel.config.js'),
    presets: [
      'module:metro-react-native-babel-preset',
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
    comments: true,
  }
  
  process.env.BABEL_ENV = mode
  const appName = `root_${appid}_${mode === 'production' ? md5(appid+uuid) : 'test'}`;
  const outpath = path.join(dirname, 'build', `v${version}`, platform)
  const outpaths = path.join(outpath, '../../', `v${version}`, 'outputs', platform)
  rimrafSync(outpath)
  rimrafSync(outpaths)
  console.log('appName: ', appName)
  console.log('outpath: ', outpath)
  console.log('outpaths: ', outpaths)
  const appConfigPath = path.join(outpath, '../../', 'outputs', 'app.json')
  fse.emptyDirSync(outpath)
  fse.emptyDirSync(outpaths)
  fse.emptyDirSync(path.join(appConfigPath, '..'))
  fse.writeJSONSync(appConfigPath, 
    {
      "type": "app",
      "name": projectConfig.projectname,
      "appid": appid,
      "version": version,
      "appUrlConfig": projectConfig.appUrlConfig,
      "zipUrl": projectConfig.zipUrl,
  }, {
    spaces: 2
  })
  const local_alias_ = {}
  for (const key in _alias_) {
    const element = _alias_[key];
    let _key = key.replace(/\/\*$/gi, '')
    if (Array.isArray(element)) {
      local_alias_[_key] = element.map(i => {
        return path.join(__dirname, '__source__', i).replace(/\/\*$/gi, '')
      })
    } else {
      local_alias_[_key] = path.join(__dirname, '__source__', element).replace(/\/\*$/gi, '')
    }
  }
  console.log(local_alias_)
  const _options = Repack.getResolveOptions(platform);
  _options.extensions.unshift('.react-native.js', '.react-native.ts', '.react-native.tsx', '.rn.js', '.rn.ts')
  console.log(_options)
  return {
    mode,
    devtool: false,
    context,
    entry: [
      ...Repack.getInitializationEntries(reactNativePath, {
        hmr: devServer && devServer.hmr,
      }),
      entry,
    ],
    resolve: {
      ..._options,
      alias: {
        ...local_alias_,
        '@babel/runtime': path.join(node_modulesPath, `@babel/runtime`),
        axios$: path.join(node_modulesPath, 'axios/dist/browser/axios.cjs'),
        cheerio$: path.join(node_modulesPath, 'cheerio/lib/index.js'),
        realm$: path.join(node_modulesPath, 'realm/index.react-native.js'),
        "@realm/fetch": path.join(node_modulesPath, '@realm/fetch/dist/react-native/react-native.js'),
        // immer$: path.join(node_modulesPath, 'immer/dist/index.js'),
        '@sentry/react-native': path.join(node_modulesPath, `@sentry/react-native/dist/js/index.js`),
        'native-base': path.join(node_modulesPath, `native-base/lib/commonjs/index.js`),
        '@react-stately/combobox': path.join(node_modulesPath, `@react-stately/combobox/src/index.ts`),

        // '@/components': path.join(__dirname, '__source__/src/pages/components'),
        // '@/utils': path.join(__dirname, '__source__/src/pages/utils'),
        // '@/assets': path.join(__dirname, '__source__/src/assets'),
        // '@/platform': path.join(__dirname, '__source__/src/platform'),
      },
    },
    
    output: {
      clean: true,
      path: outpath,
      filename: 'index.bundle',
      chunkFilename: `[name].chunk.bundle`,
      // chunkFilename: `${appName}.[name].chunk.bundle`,
      publicPath: Repack.getPublicPath({ platform, devServer }),
    },
    optimization: {
      minimize,
      minimizer: [
        new TerserPlugin({
          test: /\.(js)?bundle(\?.*)?$/i,
          extractComments: false,
          terserOptions: {
            format: {
              comments: false,
            },
          },
        }),
      ],
      chunkIds: 'named',
      moduleIds: 'named',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx|cjs)$/, 
          exclude: /node_modules/,
          use: (info) => {
            console.log()
            console.log('====== rules =======')
            console.log('****')
            console.log(info.resource)
            console.log('****')
            console.log('====== rules =======')
            console.log()
            return {
              loader: 'babel-loader',
              options: {
                ...babelOptions,
              },
            }
          }
        },
        {
          test: /\.(js|jsx|ts|tsx|cjs)$/, 
          include: [
            /node_modules/,
            /node_modules(.*[/\\])+react-native/,
            /node_modules(.*[/\\])+axios/,
          ],
           use: {
            loader: 'babel-loader',
            options: {
              ...babelOptions,
            },
          },
        },

        {
          test: /\.(js|jsx|ts|tsx|cjs)$/, 
          include: [
            /node_modules(.*[/\\])+react/,
            /node_modules(.*[/\\])+@react-native/,
            /node_modules(.*[/\\])+@react-navigation/,
            /node_modules(.*[/\\])+@react-native-community/,
            /node_modules(.*[/\\])+@expo/,
            /node_modules(.*[/\\])+pretty-format/,
            /node_modules(.*[/\\])+metro/,
            /node_modules(.*[/\\])+abort-controller/,
            /node_modules(.*[/\\])+@callstack\/repack/,
            /** 第三方模块 */
            /node_modules(.*[/\\])+@shopify\/flash-list/,
            /node_modules(.*[/\\])+mobx/,
            /node_modules(.*[/\\])+mobx-react-lite/,
            /node_modules(.*[/\\])+react-i18next/,
            /node_modules(.*[/\\])+i18next/,
            /node_modules(.*[/\\])+@gorhom\/bottom-sheet/,
            /node_modules(.*[/\\])+@gorhom\/portal/,
            /node_modules(.*[/\\])+react-native-progress/,
            /node_modules(.*[/\\])+trtc-react-native/,
            /node_modules(.*[/\\])+native-base/,
            /node_modules(.*[/\\])+@native-html\/transient-render-engine/,
            /node_modules(.*[/\\])+@react-native-render-html/,
            /node_modules(.*[/\\])+@native-html\/css-processor/,
            /node_modules(.*[/\\])+@react-stately\/combobox/,
            /node_modules(.*[/\\])+simplex-noise/,
            /node_modules(.*[/\\])+@dr.pogodin\/js-utils/,
            /node_modules(.*[/\\])+lru-cache/,
            /node_modules(.*[/\\])+react-native-paper/,
            /node_modules(.*[/\\])+expo/,
            /node_modules(.*[/\\])+@sentry/,
            /node_modules(.*[/\\])+@hongtangyun/,
            /node_modules(.*[/\\])+@tarojs/,
            /node_modules(.*[/\\])+ffmpeg-kit-react-native/,
            /node_modules(.*[/\\])+mediasoup-client/,
            /node_modules(.*[/\\])+h264-profile-level-id/,
            /node_modules(.*[/\\])+awaitqueue/,
            /node_modules(.*[/\\])+semver/,
            /node_modules(.*[/\\])+engine.io-client/,
            /node_modules(.*[/\\])+socket.io/,
            /node_modules(.*[/\\])+@react-statel\/combobox/,
            /node_modules(.*[/\\])+parse5/,
            /node_modules(.*[/\\])+domhandler/,
            /node_modules(.*[/\\])+domutils/,
            /node_modules(.*[/\\])+htmlparser2/,
            /node_modules(.*[/\\])+cheerio/,
            /node_modules(.*[/\\])+rn-update-apk/,
            /node_modules(.*[/\\])+@craftzdog\/react-native-buffer/,
            /node_modules(.*[/\\])+buffer/,
            /node_modules(.*[/\\])+@react-aria/,
            /node_modules(.*[/\\])+@react-stately/,
            /node_modules(.*[/\\])+react-native-config/,
          ],
           use: {
            loader: 'babel-loader',
            options: {
              ...babelOptions,
            },
          },
        },
        
        // {
        //   test: /\.[jt]sx?$/,
        //   exclude: /node_modules/,
        //   use: {
        //     loader: 'babel-loader',
        //     options: {
        //       presets: ['module:metro-react-native-babel-preset'],
        //       /** Add React Refresh transform only when HMR is enabled. */
        //       plugins:
        //         devServer && devServer.hmr
        //           ? ['module:react-refresh/babel']
        //           : undefined,
        //     },
        //   },
        // },
        
        {
          test: Repack.getAssetExtensionsRegExp(
            Repack.ASSET_EXTENSIONS.filter(ext => ext !== 'svg'),
          ),
          use: {
            loader: '@callstack/repack/assets-loader',
            options: {
              platform,
              inline: true,
              devServerEnabled: Boolean(devServer),
              scalableAssetExtensions: Repack.SCALABLE_ASSETS,
            },
          },
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                native: true,
                dimensions: false,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 2
      }),
      new webpack.DefinePlugin({
        /**
         * appid
         */
        __APP_DEFINE_APPID__: `"${appid}"`,
        /**
         * app 版本号
         */
        __APP_DEFINE_VERSION__: `"${version}"`,
        /**
         * app 打包时间
         */
        __APP_DEFINE_BUILD_TIME__:`"${new Date().getTime()}"`,
      }),
      // new webpack.ids.HashedModuleIdsPlugin({
      //   context: path.join(`${dirname}`, `${appid}`, `${version}`, `${new Date().getTime()}`),
      //   hashFunction: 'sha256',
      //   hashDigest: 'hex',
      //   hashDigestLength: 20,
      // }),
      new Repack.RepackPlugin({
        context,
        mode,
        platform,
        devServer,
        output: {
          bundleFilename,
        },
      }),
      new Repack.plugins.ModuleFederationPlugin({
        name: `${appid}_v${version.replace(/\./gi, '_')}`,
        exposes: {
          './App': {
            import: exposesPath,
            name: appName
          },
        },
        shared: {
          ...sharedObj,
          react: {
            ...Repack.Federated.SHARED_REACT,
            requiredVersion: appSharedObj['react'].replace(/\^/gi, '')
          },
          'react-native': {
            ...Repack.Federated.SHARED_REACT_NATIVE,
            requiredVersion: appSharedObj['react-native'].replace(/\^/gi, '')
          },
        },
      }),
      new WebpackObfuscator({
        rotateUnicodeArray: true
      }, [])
    ],
  }
}
