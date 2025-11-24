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
    const spinner = ora('正在初始化项目...').start();

    try {
      // 1. 获取用户输入
      const userInputs = await this.getUserInputs();

      // 2. 验证输入
      const validation = this.validateInputs(userInputs);
      if (!validation.isValid) {
        spinner.fail('输入验证失败');
        Logger.error(validation.error);
        return;
      }

      // 3. 检查目录
      const rootPath = path.join(process.cwd(), userInputs.appName);
      if (fs.existsSync(rootPath)) {
        spinner.fail('目录已存在');
        Logger.error(`目录已存在: ${rootPath}`);
        return;
      }

      // 4. 创建项目
      await this.createProject(userInputs, rootPath, spinner);

      // 5. 显示成功信息
      this.showSuccessInfo(userInputs.appName, rootPath);

    } catch (error) {
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
        { name: 'Coding (最快)', value: CONSTANTS.TEMPLATE_REPOS.CODING }
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

  async createProject(userInputs, rootPath, spinner) {
    const { appName, displayName, templateType, repoType } = userInputs;

    // 创建临时目录
    spinner.text = '正在准备临时目录...';
    const tmpdir = path.join(os.tmpdir(), md5('__HTYF__'), appName);
    fse.emptyDirSync(tmpdir);

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

      // 生成配置
      spinner.text = '正在生成项目配置...';
      const appid = this.config.generateAppId();
      const projectConfig = this.config.createProjectConfig(appName, displayName, appid);

      // 写入配置文件
      const configPath = path.join(appRootPath, 'project.dgz.json');
      fs.writeFileSync(configPath, JSON.stringify(projectConfig, undefined, 2));

      // 清理临时文件
      spinner.text = '正在清理临时文件...';
      const tempPath = path.join(appRootPath, '__TEMP__');
      if (fs.existsSync(tempPath)) {
        fse.removeSync(tempPath);
      }

      // 移动到目标目录
      spinner.text = '正在创建项目目录...';
      fse.moveSync(appRootPath, rootPath);

      // 清理临时目录
      fse.removeSync(tmpdir);

      spinner.succeed('项目创建完成');

    } catch (error) {
      // 清理临时目录
      if (fs.existsSync(tmpdir)) {
        fse.removeSync(tmpdir);
      }
      throw error;
    }
  }

  showSuccessInfo(appName, rootPath) {
    console.log('\n' + boxen(
      gradient.rainbow('🎉 项目创建成功!') + '\n\n' +
      chalk.cyan('项目名称: ') + chalk.white(appName) + '\n' +
      chalk.cyan('项目路径: ') + chalk.white(rootPath) + '\n\n' +
      chalk.yellow('下一步操作:') + '\n' +
      chalk.white(`  cd ${appName}`) + '\n' +
      chalk.white('  npm install') + '\n' +
      chalk.white('  npm run dev:weapp') + '\n\n' +
      chalk.blue('常用命令:') + '\n' +
      chalk.white('  npm run build:weapp  # 构建微信小程序') + '\n' +
      chalk.white('  npm run build:h5     # 构建H5版本') + '\n' +
      chalk.white('  npm run build:rn     # 构建React Native版本') + '\n\n' +
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

