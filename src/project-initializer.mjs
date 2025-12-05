import fs from 'fs';
import path from 'path';
import os from 'os';
import fse from 'fs-extra';
import md5 from 'md5';
import lodash from 'lodash';
import ora from 'ora';
import boxen from 'boxen';
import chalk from 'chalk';
import gradient from 'gradient-string';
import { input, confirm } from '@inquirer/prompts';
import select from '@inquirer/select';
import { Logger } from './logger.mjs';
import { CONSTANTS } from './constants.mjs';
import { ProjectConfig } from './config.mjs';
import { TemplateProcessor } from './template-processor.mjs';
import { FileSystemUtils } from './file-system.mjs';

/**
 * 项目初始化器类
 */
export class ProjectInitializer {
  constructor() {
    this.config = new ProjectConfig();
    this.processor = new TemplateProcessor(this.config);
  }

  async initialize() {
    const spinner = ora('正在初始化项目...');
    let tmpdir = null;
    let rootPath = null;

    // 信号处理：清理临时文件并停止 spinner
    const handleExit = () => {
      spinner.stop();
      Logger.info('\n正在清理临时文件...');
      if (tmpdir && fs.existsSync(tmpdir)) {
        try {
          fse.removeSync(tmpdir);
          Logger.info('临时文件已清理');
        } catch (error) {
          Logger.warn(`清理临时文件时出错: ${error.message}`);
        }
      }
      Logger.info('已取消项目初始化');
      process.exit(0);
    };

    process.once('SIGINT', handleExit);
    process.once('SIGTERM', handleExit);

    try {
      // 1. 获取用户输入
      const userInputs = await this.getUserInputs();

      // 2. 验证输入
      const validation = this.validateInputs(userInputs);
      if (!validation.isValid) {
        process.removeListener('SIGINT', handleExit);
        process.removeListener('SIGTERM', handleExit);
        spinner.fail('输入验证失败');
        Logger.error(validation.error);
        return;
      }

      // 3. 检查目录
      rootPath = path.join(process.cwd(), userInputs.appName);
      if (fs.existsSync(rootPath)) {
        process.removeListener('SIGINT', handleExit);
        process.removeListener('SIGTERM', handleExit);
        spinner.fail('目录已存在');
        Logger.error(`目录已存在: ${rootPath}`);
        return;
      }

      // 4. 创建项目（在此之前启动 spinner）
      spinner.start();
      spinner.text = '正在初始化项目...';
      // 传递 tmpdir 引用以便清理
      await this.createProject(userInputs, rootPath, spinner, (dir) => {
        tmpdir = dir;
      });

      // 移除信号监听器
      process.removeListener('SIGINT', handleExit);
      process.removeListener('SIGTERM', handleExit);

      // 5. 显示成功信息
      this.showSuccessInfo(userInputs.appName, rootPath, userInputs.templateType);

    } catch (error) {
      process.removeListener('SIGINT', handleExit);
      process.removeListener('SIGTERM', handleExit);
      spinner.fail('项目初始化失败');
      Logger.error('初始化失败:', error.message);
      if (error.exitCode === 128) {
        Logger.error('Error: 目录已经存在。');
      } else if (error.code === 'ENOTFOUND') {
        Logger.error('网络连接失败，请检查网络连接或尝试使用其他镜像源。');
      } else if (error.code === 'ECONNREFUSED') {
        Logger.error('连接被拒绝，请检查防火墙设置或网络配置。');
      }
    }
  }

  async getUserInputs() {
    Logger.info('\n开始收集项目信息...\n');

    const appName = await input({
      message: '输入应用程序目录名称',
      default: 'my-htyf-mp',
      validate: (input) => {
        if (!this.config.validateAppName(input)) {
          return '请以 my-app-name 格式输入您的应用程序英文目录名称';
        }
        return true;
      }
    });

    const displayName = await input({
      message: '输入应用程序名称',
      default: '小程序',
      validate: (input) => {
        if (!this.config.validateDisplayName(input)) {
          return '只能中文、字母和数字, 不能包含特殊字符, 限2-4个字符';
        }
        return true;
      }
    });

    const templateType = await select({
      message: '请选择模板类型?',
      choices: Object.entries(this.config.templates).map(([key, template]) => ({
        name: template.name,
        value: key
      }))
    });

    Logger.info(`已选择模板: ${this.config.templates[templateType].name}`);

    const repoType = await select({
      message: '请选择模板镜像?',
      choices: [
        { name: 'GitHub (最新)', value: CONSTANTS.TEMPLATE_REPOS.GITHUB },
      ]
    });

    return { appName, displayName, templateType, repoType };
  }

  validateInputs(inputs) {
    const pathValidation = FileSystemUtils.validatePath(inputs.appName);
    if (!pathValidation.isValid) {
      return { isValid: false, error: pathValidation.error };
    }

    return { isValid: true };
  }

  async createProject(userInputs, rootPath, spinner, setTmpdirCallback = null) {
    const { appName, displayName, templateType, repoType } = userInputs;

    // 创建临时目录
    spinner.text = '正在准备临时目录...';
    const tmpdir = path.join(os.tmpdir(), md5('__HTYF__'), appName);
    fse.emptyDirSync(tmpdir);
    
    // 设置临时目录引用，以便在退出时清理
    if (setTmpdirCallback) {
      setTmpdirCallback(tmpdir);
    }

    try {
      // 克隆仓库
      spinner.text = '正在克隆模板仓库...';
      await this.processor.cloneRepository(repoType, tmpdir);

      // 确定应用根路径
      const template = this.config.templates[templateType];
      const appRootPath = path.join(tmpdir, template.tempPath);

      // 清理不需要的文件
      spinner.text = '正在清理模板文件...';
      this.processor.cleanupUnusedTemplates(tmpdir, templateType);

      // 处理模板
      spinner.text = '正在处理模板...';
      this.processor.processTemplate(appRootPath, templateType);

      const isGodot = templateType === CONSTANTS.TEMPLATE_TYPES.GAME_TEMPLATE;

      // 生成配置
      spinner.text = '正在生成项目配置...';
      const appid = this.config.generateAppId();
      const projectConfig = this.config.createProjectConfig(appName, displayName, appid, isGodot ? 'landscape' : 'portrait');
      // 写入配置文件
      const configPath = path.join(appRootPath, 'app.json');
      let existingConfig = {};
      
      // 检查 app.json 是否存在
      if (fs.existsSync(configPath)) {
        // 如果存在，读取现有内容
        const existingContent = fs.readFileSync(configPath, 'utf-8');
        try {
          existingConfig = JSON.parse(existingContent);
        } catch (error) {
          Logger.warn('app.json 格式错误，将创建新配置');
          existingConfig = {};
        }
      }
      
      // 添加 htyf 字段
      existingConfig.htyf = {
        ...(existingConfig?.htyf || {}),
        ...projectConfig
      };
      
      // 写入配置文件
      fs.writeFileSync(configPath, JSON.stringify(existingConfig, undefined, 2));

      // 清理临时文件
      spinner.text = '正在清理临时文件...';
      const tempPath = path.join(appRootPath, '__TEMP__');
      if (fs.existsSync(tempPath)) {
        fse.removeSync(tempPath);
      }

      // 移动到目标目录
      spinner.text = '正在创建项目目录...';

      if (fs.existsSync(rootPath)) {
        fse.ensureDirSync(rootPath);
        const items = fs.readdirSync(appRootPath);
        items.forEach((item) => {
          const source = path.join(appRootPath, item);
          const destination = path.join(rootPath, item);
          fse.moveSync(source, destination, { overwrite: true });
        });
        fse.removeSync(appRootPath);
      } else {
        fse.moveSync(appRootPath, rootPath);
      }

      // 清理临时目录
      fse.removeSync(tmpdir);

      spinner.succeed('项目创建完成');

    } catch (error) {
      // 清理临时目录
      if (fs.existsSync(tmpdir)) {
        // fse.removeSync(tmpdir);
      }
      throw error;
    }
  }

  showSuccessInfo(appName, rootPath, templateType) {
    console.log('\n' + boxen(
      gradient.rainbow('🎉 项目创建成功!') + '\n\n' +
      chalk.cyan('项目名称: ') + chalk.white(appName) + '\n' +
      chalk.cyan('项目路径: ') + chalk.white(rootPath) + '\n\n' +
      chalk.yellow('下一步操作:') + '\n' +
      (() => {
        const relativePath = path.relative(process.cwd(), rootPath);
        const commands = [];
        if (relativePath) {
          commands.push(chalk.white(`  cd ${relativePath}`));
        }

        if (templateType === CONSTANTS.TEMPLATE_TYPES.GAME_TEMPLATE) {
          commands.push(chalk.white('  npm install'));
        } else {
          commands.push(
            chalk.white('  npm install'),
            chalk.white('  npm run ios'),
            chalk.white('  npm run android')
          );
        }

        return commands.join('\n');
      })() + '\n\n' +
      chalk.blue('常用命令:') + '\n' +
      chalk.white('  npm run htyf  # 构建红糖云服小程序') + '\n' +
      chalk.gray('💡 提示: 使用 --debug 参数可以查看详细的调试信息'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    ));
  }
}

