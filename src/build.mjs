import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import AdmZip from 'adm-zip';
import { Logger } from './logger.mjs';
import { CONSTANTS } from './constants.mjs';
import { FileSystemUtils } from './file-system.mjs';
import { CommandExecutor } from './command-executor.mjs';
import { getMiniAppScriptId } from './utils-functions.mjs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 压缩文件夹为zip文件
 * @param {string} inputPath - 输入路径
 * @param {string} outputPath - 输出路径
 * @returns {Promise<string>} 压缩包路径
 */
export async function handleZip(inputPath, outputPath) {
  Logger.info(`开始压缩文件夹: ${inputPath}`);
  Logger.info(`输出文件: ${outputPath}`);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`输入路径不存在: ${inputPath}`);
  }

  const stats = fs.statSync(inputPath);
  if (!stats.isDirectory()) {
    throw new Error(`输入路径不是目录: ${inputPath}`);
  }

  const files = fs.readdirSync(inputPath);
  Logger.debug(`目录内容: ${files.length} 个文件/文件夹`);

  if (files.length === 0) {
    Logger.warn(`警告: 目录为空，将创建空的zip文件`);
  }

  const zipPath = outputPath;
  const admzip = new AdmZip();

  try {
    await admzip.addLocalFolderPromise(inputPath, {
      filter: (filename) => {
        if (filename.endsWith('.map')) {
          Logger.debug(`过滤文件: ${filename}`);
          return false;
        }
        Logger.debug(`添加文件: ${filename}`);
        return true;
      }
    });

    await admzip.writeZipPromise(zipPath);
    Logger.success(`压缩完成: ${zipPath}`);

    const zipStats = fs.statSync(zipPath);
    Logger.info(`ZIP文件大小: ${FileSystemUtils.formatFileSize(zipStats.size)}`);

    return zipPath;
  } catch (error) {
    Logger.error(`压缩失败: ${error.message}`);
    throw error;
  }
}

/**
 * 构建小程序包
 * @param {object} newAppInfo - 应用信息
 * @returns {Promise<string>} 压缩包路径
 */
export async function mpBuildShell(newAppInfo) {
  Logger.info(`开始构建小程序包...`);
  Logger.info(`应用: ${newAppInfo.name}`);
  Logger.info(`应用ID: ${newAppInfo.appid}`);
  Logger.info(`版本: ${newAppInfo.version}`);
  Logger.info(`平台: ${CONSTANTS.BUNDLE_PLATFORM}`);
  
  // 验证必需字段
  if (!newAppInfo.name || !newAppInfo.appid || !newAppInfo.version) {
    throw new Error('缺少必需的应用信息: name, appid, version');
  }
  
  // 创建临时目录
  const tempPath = CONSTANTS.TEMP_DIR;
  if (!FileSystemUtils.ensureDirectory(tempPath)) {
    throw new Error('无法创建临时目录');
  }

  const mpOutputPath = CONSTANTS.MP_OUTPUT_DIR;
  if (!FileSystemUtils.ensureDirectory(mpOutputPath)) {
    throw new Error('无法创建输出目录');
  }

  const version = newAppInfo.version;
  const appid = newAppInfo.appid;
  const scriptName = getMiniAppScriptId(appid, version);

  const appJson = {
    type: 'app',
    engines: '2.0.0',
    name: newAppInfo.name,
    appid: appid,
    version: version,
    appUrlConfig: newAppInfo.appUrlConfig || `${newAppInfo.host}/app.json`,
    zipUrl: newAppInfo.zipUrl || `${newAppInfo.host}/dist.dgz`
  };
  
  const outputPath = path.join(mpOutputPath, './dist');
  const rootIndexPath = path.join(tempPath, '../index.js');

  const mpOptions = {
    name: scriptName,
    filename: `${scriptName}.bundle`,
    exposes: {
      'App': newAppInfo.entry,
    },
    outputPath: path.join(mpOutputPath, './build'),
    extraChunksPath: outputPath,
  };

  const appJsonPath = path.join(mpOutputPath, 'app.json');
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, undefined, 2));
  const webpackConfigPath = path.join(__dirname, 'webpack.config.mjs');

  const command = `npx cross-env APP_ROOT_INDEX_PATH=${rootIndexPath} APP_EXPOSES_OPTIONS=${encodeURI(JSON.stringify(mpOptions))} webpack --config ${webpackConfigPath}`;

  try {
    await CommandExecutor.execute(command, {
      description: '构建小程序包',
      timeout: 120000,
      showCommand: false
    });

    fs.copyFileSync(appJsonPath, path.join(outputPath, `./app.json`));
    const zipPath = await handleZip(outputPath, path.join(outputPath, `../dist.dgz`));
    Logger.success(`压缩包已创建: ${zipPath}`);
    return zipPath;
  } catch (error) {
    Logger.error(`小程序构建失败: ${error.message}`);
    throw error;
  }
}

