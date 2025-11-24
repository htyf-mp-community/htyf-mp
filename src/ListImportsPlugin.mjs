
import path from 'path';
import fse from 'fs-extra'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sharedPkg = fse.readJSONSync(path.join(__dirname, './shared-output.json'))

function trimTemplateStrings(strings, ...values) {
  let fullString = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  return fullString.replace(/^[ \t]+/gm, '');
}

export class HtyfModulesPlugin {
  constructor(appConfig) {
    this.config = appConfig;
  }
  apply(compiler) {
    const config = this.config;
    compiler.hooks.emit.tapAsync('AnalyzeThirdPartyModulesPlugin', (compilation, callback) => {
      let thirdPartyModules = new Set();

      compilation.modules.forEach(module => {
        if (module.context && module.context.includes('node_modules')) {
          let packageName = module.context.split('node_modules/')[1].split('/')[0];
          if (packageName.startsWith('@')) {
            packageName = module.context.split('node_modules/')[1].split('/').splice(0,2).join('/');
          }
          const ios_path = path.join(__dirname, '../node_modules/', packageName, 'ios');
          const and_path = path.join(__dirname, '../node_modules/', packageName, 'android');
          const isNative = fse.pathExistsSync(ios_path) || fse.pathExistsSync(and_path);
          if (isNative) {
            thirdPartyModules.add(packageName);
          }
        }
      });
      const nonsupport = []
      thirdPartyModules = Array.from(thirdPartyModules);
      for (const key in thirdPartyModules) {
        const pkg = thirdPartyModules[key];
        if (!sharedPkg[pkg]) {
          if (
            pkg !== 'expo-splash-screen' &&
            pkg !== '@callstack/repack' &&
            pkg !== 'react-native-iap'
          ) {
            nonsupport.push(pkg)
          }
        }
      }
      if (nonsupport.length) {
        const msgArr = ['红糖云服暂不支持以上第三方native组件']
        console.log(' ')
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        console.log(' ')
        console.log('红糖云服暂不支持以下第三方native组件: ')
        for (const key in nonsupport) {
          const element = nonsupport[key];
          const _msg = `${Number(key) + 1}. ${element}`;
          console.log(_msg)
          msgArr.push(_msg)
        }
        console.log(' ')
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        console.log(' ')
        console.log(' ')
        callback(msgArr.join(`\n`));
        process.exit(1);
      } else {
        callback();
      }
    });
    if (config.codeSigning) {
      compiler.hooks.emit.tapAsync('WrapCodePlugin', (compilation, callback) => {
        // 遍历所有编译过的资源文件
        for (const filename in compilation.assets) {
          if (compilation.assets.hasOwnProperty(filename)) {
            // 获取文件内容
            let source = compilation.assets[filename].source();

            // 包裹代码
            const wrappedSource = trimTemplateStrings`
            try {
              ${source}
            } catch (error) {
              const that = globalThis || global || self || window;
              that.__htyf_error_callback__ && that.__htyf_error_callback__(error, that)
              console.error(error)
            }
            `;

            // 更新文件内容
            compilation.assets[filename] = {
              source: () => wrappedSource,
              size: () => wrappedSource.length
            };
          }
        }
        callback();
      });
    }
  }
}
