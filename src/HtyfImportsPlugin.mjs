import path from 'path';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedPkg = fse.readJSONSync(path.join(__dirname, '../shared-output.json'));

// 白名单：这些包即使有 native 代码也不需要检查（系统级或已特殊处理）
const WHITELIST = [];

/**
 * 从模块路径中提取包名
 * @param {string} moduleContext - 模块上下文路径
 * @returns {string|null} 包名，如果无法提取则返回 null
 */
function extractPackageName(moduleContext) {
  if (!moduleContext || !moduleContext.includes('node_modules')) {
    return null;
  }

  const parts = moduleContext.split('node_modules/');
  if (parts.length < 2) {
    return null;
  }

  const packagePath = parts[1];
  const segments = packagePath.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return null;
  }

  // 处理 scoped packages (@scope/package)
  if (segments[0].startsWith('@') && segments.length >= 2) {
    return `${segments[0]}/${segments[1]}`;
  }

  return segments[0];
}

/**
 * 检查包是否包含 native 代码
 * @param {string} packageName - 包名
 * @returns {boolean} 是否包含 native 代码
 */
function hasNativeCode(packageName) {
  const nodeModulesPath = path.join(__dirname, '../node_modules');
  const iosPath = path.join(nodeModulesPath, packageName, 'ios');
  const androidPath = path.join(nodeModulesPath, packageName, 'android');
  
  return fse.pathExistsSync(iosPath) || fse.pathExistsSync(androidPath);
}

/**
 * 检查包是否在共享配置中
 * @param {string} packageName - 包名
 * @returns {boolean} 是否在共享配置中
 */
function isInSharedConfig(packageName) {
  return sharedPkg && sharedPkg.hasOwnProperty(packageName);
}

/**
 * 检查包是否在白名单中
 * @param {string} packageName - 包名
 * @returns {boolean} 是否在白名单中
 */
function isWhitelisted(packageName) {
  return WHITELIST.includes(packageName);
}

/**
 * 格式化错误消息
 * @param {string[]} unsupportedPackages - 不支持的包列表
 * @returns {string} 格式化的错误消息
 */
function formatErrorMessage(unsupportedPackages) {
  const lines = [
    '',
    '═══════════════════════════════════════',
    '  红糖云服暂不支持以下第三方 native 组件',
    '═══════════════════════════════════════',
    '',
  ];

  unsupportedPackages.forEach((pkg, index) => {
    lines.push(`  ${index + 1}. ${pkg}`);
  });

  lines.push('');
  lines.push('═══════════════════════════════════════');
  lines.push('');

  return lines.join('\n');
}

function trimTemplateStrings(strings, ...values) {
  let fullString = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  return fullString.replace(/^[ \t]+/gm, '');
}

export class HtyfModulesPlugin {
  constructor(appConfig = {}) {
    this.config = appConfig;
  }

  apply(compiler) {
    const config = this.config;

    // 分析第三方 native 模块
    compiler.hooks.emit.tapAsync('AnalyzeThirdPartyModulesPlugin', (compilation, callback) => {
      try {
        const nativeModules = new Set();

        // 收集所有包含 native 代码的第三方模块
        compilation.modules.forEach(module => {
          if (!module.context) {
            return;
          }

          const packageName = extractPackageName(module.context);
          if (!packageName) {
            return;
          }

          if (hasNativeCode(packageName)) {
            nativeModules.add(packageName);
          }
        });

        // 检查不支持的包
        const unsupportedPackages = Array.from(nativeModules).filter(pkg => {
          // 跳过白名单中的包
          if (isWhitelisted(pkg)) {
            return false;
          }

          // 如果不在共享配置中，则不支持
          return !isInSharedConfig(pkg);
        });

        // 如果有不支持的包，抛出错误
        if (unsupportedPackages.length > 0) {
          const errorMessage = formatErrorMessage(unsupportedPackages);
          console.error(errorMessage);
          
          const error = new Error(
            `发现 ${unsupportedPackages.length} 个不支持的第三方 native 组件。\n${errorMessage}`
          );
          error.unsupportedPackages = unsupportedPackages;
          callback(error);
          return;
        }

        callback();
      } catch (error) {
        callback(error);
      }
    });

    // 代码签名包装（如果启用）
    if (config.codeSigning) {
      compiler.hooks.emit.tapAsync('WrapCodePlugin', (compilation, callback) => {
        try {
          // 遍历所有编译过的资源文件
          for (const filename in compilation.assets) {
            if (compilation.assets.hasOwnProperty(filename)) {
              // 获取文件内容
              const source = compilation.assets[filename].source();

              // 包裹代码
              const wrappedSource = trimTemplateStrings`
              ${source}
              `;

              // 更新文件内容
              compilation.assets[filename] = {
                source: () => wrappedSource,
                size: () => wrappedSource.length,
              };
            }
          }
          callback();
        } catch (error) {
          callback(error);
        }
      });
    }
  }
}
