#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { accessSync, constants as fsConstants } from 'node:fs';
import process from 'node:process';
import { homedir } from 'node:os';
import fs from 'fs-extra';
import AdmZip from 'adm-zip';
import { execa } from 'execa';
import inquirer from 'inquirer';

const DEFAULT_GODOT_BIN = '/Applications/Godot.app/Contents/MacOS/Godot';
const GODOT_CACHE_DIR = path.join(homedir() || process.cwd(), '.htyf');
const GODOT_CACHE_FILE = path.join(GODOT_CACHE_DIR, 'godot-config.json');

const PLATFORMS = {
  IOS: 'ios',
  ANDROID: 'android'
};

const PRESET_NAMES = {
  [PLATFORMS.IOS]: 'iOS',
  [PLATFORMS.ANDROID]: 'Android'
};

export async function promptGodotOptions(defaults = {}) {
  // 如果所有必需的值都已提供，直接返回，不进行询问
  if (
    defaults.targetBaseDir &&
    defaults.projectDir &&
    defaults.name &&
    defaults.preset &&
    defaults.platform
  ) {
    return {
      targetBaseDir: String(defaults.targetBaseDir).trim(),
      projectDir: String(defaults.projectDir).trim(),
      name: String(defaults.name).trim(),
      preset: String(defaults.preset).trim(),
      platform: defaults.platform
    };
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'targetBaseDir',
      message: '请输入导出目标根目录 (项目 dist 目录):',
      default: defaults.targetBaseDir || path.resolve(process.cwd(), './dist'),
      validate: (input) => !!input.trim() || '目标根目录不能为空'
    },
    {
      type: 'input',
      name: 'projectDir',
      message: '请输入 Godot 项目目录:',
      default: defaults.projectDir || process.cwd(),
      validate: (input) => !!input.trim() || '项目目录不能为空'
    },
    {
      type: 'input',
      name: 'name',
      message: '请输入导出文件名称 (不含扩展名):',
      default: defaults.name || 'GodotExport',
      validate: (input) => !!input.trim() || '导出文件名称不能为空'
    },
    {
      type: 'input',
      name: 'preset',
      message: '请输入 Godot 导出预设名称:',
      default: defaults.preset || '',
      validate: (input) => !!input.trim() || '导出预设名称不能为空'
    },
    {
      type: 'list',
      name: 'platform',
      message: '请选择导出平台:',
      choices: [
        { name: 'iOS', value: PLATFORMS.IOS },
        { name: 'Android', value: PLATFORMS.ANDROID }
      ],
      default: defaults.platform || 'ios'
    }
  ]);

  return {
    targetBaseDir: answers.targetBaseDir.trim(),
    projectDir: answers.projectDir.trim(),
    name: answers.name.trim(),
    preset: answers.preset.trim(),
    platform: answers.platform
  };
}

function isExecutable(filePath) {
  if (!filePath) return false;
  if (!fs.existsSync(filePath)) return false;

  try {
    accessSync(filePath, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function readCachedGodotPath() {
  try {
    if (!fs.existsSync(GODOT_CACHE_FILE)) {
      return '';
    }
    const data = fs.readJsonSync(GODOT_CACHE_FILE);
    return typeof data?.godotPath === 'string' ? data.godotPath : '';
  } catch {
    return '';
  }
}

async function writeCachedGodotPath(godotPath) {
  try {
    await fs.ensureDir(GODOT_CACHE_DIR);
    await fs.writeJson(GODOT_CACHE_FILE, { godotPath }, { spaces: 2 });
  } catch {
    // cache failures should not block execution
  }
}

async function promptForGodotBinaryPath(defaultPath) {
  const { godotPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'godotPath',
      message: '请输入 Godot Editor 可执行文件路径:',
      default: defaultPath,
      validate: (input) => !!input.trim() || '路径不能为空'
    }
  ]);

  return godotPath.trim();
}

async function resolveGodotBinary() {
  const override = process.env.GODOT_EDITOR ? process.env.GODOT_EDITOR.trim() : '';
  if (override && isExecutable(override)) {
    return override;
  }

  const cached = readCachedGodotPath();
  if (cached && isExecutable(cached)) {
    return cached;
  }

  if (isExecutable(DEFAULT_GODOT_BIN)) {
    await writeCachedGodotPath(DEFAULT_GODOT_BIN);
    return DEFAULT_GODOT_BIN;
  }

  const fallbackDefault = override || cached || DEFAULT_GODOT_BIN;
  const godotPath = await promptForGodotBinaryPath(fallbackDefault);

  if (!isExecutable(godotPath)) {
    throw new Error(`Godot 二进制文件不可执行: ${godotPath}`);
  }

  await writeCachedGodotPath(godotPath);
  return godotPath;
}

async function runGodotCommand(godotBin, args) {
  await execa(godotBin, args, { stdio: 'inherit' });
}

async function handleAndroidExport({ godotBin, projectDir, preset, targetBaseDir, name }) {
  const assetsBaseDir = path.join(targetBaseDir, 'android', 'app', 'src', 'main', 'assets');
  await fs.ensureDir(assetsBaseDir);

  const zipPath = path.join(assetsBaseDir, `${name}.zip`);
  await runGodotCommand(godotBin, ['--headless', '--path', projectDir, '--export-pack', preset, zipPath]);

  const targetDir = path.join(assetsBaseDir, name);
  await fs.remove(targetDir);
  await fs.ensureDir(targetDir);

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(targetDir, true);
  await fs.remove(zipPath);
}

async function handleIosExport({ godotBin, projectDir, preset, targetBaseDir, name }) {
  const assetsBaseDir = path.join(targetBaseDir, 'ios');
  await fs.ensureDir(assetsBaseDir);
  const outputPath = path.join(assetsBaseDir, `${name}.pck`);
  await runGodotCommand(godotBin, ['--headless', '--path', projectDir, '--export-pack', preset, outputPath]);
}

export async function exportGodot(options) {
  const godotBin = await resolveGodotBinary();
  const { platform, projectDir, preset, targetBaseDir, name } = options;

  // 执行两次 import 以确保资源正确导入
  const importArgs = ['--headless', '--path', projectDir, '--import'];
  await runGodotCommand(godotBin, importArgs);
  await runGodotCommand(godotBin, importArgs);

  switch (platform) {
    case PLATFORMS.IOS:
      await handleIosExport({ godotBin, projectDir, preset, targetBaseDir, name });
      break;
    case PLATFORMS.ANDROID:
      await handleAndroidExport({ godotBin, projectDir, preset, targetBaseDir, name });
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}. Supported: ${Object.values(PLATFORMS).join(', ')}`);
  }
}

async function main() {
  const options = await promptGodotOptions();
  await exportGodot(options);
}

const isCliExecution = (() => {
  if (!process.argv[1]) {
    return false;
  }
  const cliUrl = pathToFileURL(process.argv[1]).href;
  return cliUrl === import.meta.url;
})();

if (isCliExecution) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}

