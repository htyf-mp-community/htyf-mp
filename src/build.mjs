import path from 'path';
import fse from 'fs-extra';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'node:url';
import { Logger } from './logger.mjs';
import { CONSTANTS } from './constants.mjs';
import { FileSystemUtils } from './file-system.mjs';
import { CommandExecutor } from './command-executor.mjs';
import { getMiniAppScriptId } from './utils-functions.mjs';
import { getProjectRoot, guessGodotProjectDir } from './utils.mjs';
import { exportGodot, promptGodotOptions } from './export_godot.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = getProjectRoot();

/**
 * 压缩文件夹为zip文件
 * @param {string} inputPath - 输入路径
 * @param {string} outputPath - 输出路径
 * @returns {Promise<string>} 压缩包路径
 */
export async function handleZip(inputPath, outputPath) {
  Logger.info(`开始压缩文件夹: ${inputPath}`);
  Logger.info(`输出文件: ${outputPath}`);

  if (!(await fse.pathExists(inputPath))) {
    throw new Error(`输入路径不存在: ${inputPath}`);
  }

  const stats = await fse.stat(inputPath);
  if (!stats.isDirectory()) {
    throw new Error(`输入路径不是目录: ${inputPath}`);
  }

  const files = await fse.readdir(inputPath);
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

    const zipStats = await fse.stat(zipPath);
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
export async function mpBuildShell(newAppInfo, isGodot) {
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

  const { version, appid } = newAppInfo;
  const scriptName = getMiniAppScriptId(appid, version);

  const appJson = {
    type: isGodot ? 'game' : 'app',
    engines: '2.0.0',
    name: newAppInfo.name,
    appid,
    version,
    appUrlConfig: newAppInfo.appUrlConfig || `${newAppInfo.host}/app.json`,
    zipUrl: newAppInfo.zipUrl || `${newAppInfo.host}/dist.dgz`
  };
  
  let outputPath = path.join(mpOutputPath, 'dist');
  let distPackagePath = path.join(mpOutputPath, 'dist.dgz');
  const rootIndexPath = path.join(tempPath, '..', 'index.js');

  const mpOptions = {
    name: scriptName,
    filename: `${scriptName}.bundle`,
    exposes: {
      'App': newAppInfo.entry,
    },
    outputPath: path.join(mpOutputPath, 'build'),
    extraChunksPath: outputPath,
    manifest: path.join(mpOutputPath, 'build'),
  };

  const appJsonPath = path.join(mpOutputPath, 'app.json');
  await fse.writeJson(appJsonPath, appJson, { spaces: 2 });
  const webpackConfigPath = path.join(__dirname, 'webpack.config.mjs');


  try {
    if (!isGodot) {
      const command = `npx cross-env APP_ROOT_INDEX_PATH=${rootIndexPath} APP_EXPOSES_OPTIONS=${encodeURI(JSON.stringify(mpOptions))} webpack --config ${webpackConfigPath}`;
      await CommandExecutor.execute(command, {
        description: '构建小程序包',
        timeout: 120000,
        showCommand: false
      });
    } else {
      Logger.info('检测到 Godot 项目，开始执行 Godot 导出流程...');
      const defaultPlatform = ['android', 'ios'].includes(CONSTANTS.BUNDLE_PLATFORM) 
        ? CONSTANTS.BUNDLE_PLATFORM 
        : 'ios';
      const godotDefaults = {
        targetBaseDir: outputPath,
        projectDir: guessGodotProjectDir(PROJECT_ROOT),
        name: newAppInfo.appid || 'GodotApp',
        preset: defaultPlatform === 'android' ? 'Android' : 'iOS',
        platform: defaultPlatform
      };
      const godotOptions = await promptGodotOptions(godotDefaults);
      outputPath = path.resolve(godotOptions.targetBaseDir);
      await fse.ensureDir(outputPath);
      await fse.emptyDir(outputPath);
      await exportGodot(godotOptions);
      
      // Godot 项目使用平台特定的文件名
      const platformName = godotOptions.platform === 'ios' ? 'ios' : 'android';
      distPackagePath = path.join(mpOutputPath, `dist.${platformName}.dgz`);
      // 更新 appJson 中的 zipUrl
      appJson.zipUrl = newAppInfo.zipUrl || `${newAppInfo.host}/dist.${platformName}.dgz`;
      await fse.writeJson(appJsonPath, appJson, { spaces: 2 });
    }

    await fse.ensureDir(outputPath);
    await fse.copy(appJsonPath, path.join(outputPath, 'app.json'));
    const zipPath = await handleZip(outputPath, distPackagePath);
    Logger.success(`压缩包已创建: ${zipPath}`);
    return zipPath;
  } catch (error) {
    Logger.error(`小程序构建失败: ${error.message}`);
    throw error;
  }
}

