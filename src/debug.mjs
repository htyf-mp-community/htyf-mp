import path from 'path';
import fse from 'fs-extra';
import superstatic from 'superstatic';
import portfinder from 'portfinder';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import { Logger } from './logger.mjs';
import { ConfigValidator } from './validators.mjs';
import { mpBuildShell } from './build.mjs';
import { printQrcode } from './utils-functions.mjs';

/**
 * 小程序真机调试
 * @param {object} newAppInfo - 应用信息
 */
export async function mpDebugShell(newAppInfo) {
  try {
    // 验证必需字段
    if (!newAppInfo.entry) {
      throw new Error('缺少必需的应用信息: entry');
    }
    
    const zipPath = await mpBuildShell(newAppInfo);
    const assetsPath = path.dirname(zipPath);
    const appJsonPath = path.join(assetsPath, 'app.json');

    Logger.info(`资源路径: ${assetsPath}`);
    const applocaljson = fse.readJsonSync(appJsonPath);

    // 验证网络配置
    const networkValidation = await ConfigValidator.validateNetworkConfig();
    if (!networkValidation.isValid) {
      throw new Error(`网络配置验证失败: ${networkValidation.error}`);
    }

    const host = networkValidation.host;
    const port = await portfinder.getPortPromise();

    const app = superstatic.server({
      port: port,
      address: host,
      cwd: assetsPath
    });

    const server = app.listen(function () {
      const address = server.address();

      const debugerAppUrlConfig = `http://${host}:${address.port}/app.json`;
      const debugerZip = `http://${host}:${address.port}/dist.dgz`;
      const args = {
        ...applocaljson,
        development: true,
        "name": applocaljson.name,
        "appid": applocaljson.appid,
        "version": applocaljson.version,
        appUrlConfig: debugerAppUrlConfig,
        zipUrl: debugerZip,
      };

      fse.writeJSONSync(appJsonPath, {
        ...fse.readJSONSync(appJsonPath),
        appUrlConfig: debugerAppUrlConfig,
        zipUrl: debugerZip,
      });

      const qrcodeUrl = `https://share.dagouzhi.com/#/pages/index/index?data=${encodeURIComponent(JSON.stringify(args))}`;

      // 显示调试信息
      console.log('\n');
      console.log(boxen(
        gradient.rainbow('小程序真机调试') + '\n\n' +
        chalk.cyan('服务器地址: ') + chalk.white(`${host}:${address.port}`) + '\n' +
        chalk.cyan('应用名称: ') + chalk.white(applocaljson.name) + '\n' +
        chalk.cyan('应用ID: ') + chalk.white(applocaljson.appid) + '\n' +
        chalk.cyan('版本: ') + chalk.white(applocaljson.version),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'cyan'
        }
      ));

      console.log('\n' + chalk.yellow('调试配置:'));
      console.log(JSON.stringify(args, undefined, 2));

      console.log('\n' + chalk.green('调试链接:'));
      console.log(qrcodeUrl);

      console.log('\n' + chalk.blue('二维码:'));
      printQrcode(qrcodeUrl);

      Logger.info('调试服务器已启动，按 Ctrl+C 停止');
    });

    // 优雅关闭
    process.on('SIGINT', () => {
      Logger.info('正在关闭调试服务器...');
      server.close(() => {
        Logger.success('调试服务器已关闭');
        process.exit(0);
      });
    });

  } catch (error) {
    Logger.error(`小程序调试失败: ${error.message}`);
    process.exit(1);
  }
}

