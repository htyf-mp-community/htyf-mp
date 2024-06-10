#!/usr/bin/env node

import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'
import { Command } from 'commander'
import select from '@inquirer/select'
import { input } from '@inquirer/prompts';
import {execa, execaCommand} from 'execa'
import ora from 'ora'
import childProcess from 'child_process'
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5'

const v4options = {
  random: [
    0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58, 0x36,
  ],
};

const log = console.log
const program = new Command()
const green = chalk.green

const repoUrl = 'https://github.com/htyf-mp-community/htyf-mp.git'

const taroTempPath = 'mini-apps-template';
const expoTempPath = 'mini-apps-template';
const gameTempPath = 'mini-game-template-cocos';

const isYarnInstalled = () => {
  try {
    childProcess.execSync('yarn --version');
    return true;
  } catch {
    return false; 
  }
}

const isBunInstalled = () => {
  try {
    childProcess.execSync('bun --version')
    return true;
  } catch(err) {
    return false; 
  }
}

async function main() {
  const spinner = ora({
    text: '创建代码库'
  })
  try {
    const kebabRegez = /^([a-z]+)(-[a-z0-9]+)*$/

    program
      .name('红糖云服APP-小程序')
      .description('快速创建红糖云服APP小程序')
  
    program.parse(process.argv)
  
    const args = program.args
    let appName = args[0]
  
    if (!appName || !kebabRegez.test(args[0])) {
      appName = await input({
        message: '输入应用程序目录名称',
        default: 'my-htyf-mp',
        validate: d => {
         if(!kebabRegez.test(d)) {
          return '请以my-app-name格式输入您的应用程序目录名称'
         }
         return true
        }
      })
    }

    const displayNameRegez = /^[\u4e00-\u9fa5a-zA-Z0-9]{2,4}$/

    let displayName = ''
    if (!displayName) {
      displayName = await input({
        message: '输入应用程序名称',
        default: '小程序',
        validate: d => {
         if(!displayNameRegez.test(d)) {
          return '只能中文、字母和数字, 不能包含特殊字符, 限2-4个字符'
         }
         return true
        }
      })
    }
  
    const tempType = await select({
      message: '请选择模板类型?',
      choices: [
        {
          name: 'Expo (https://docs.expo.dev/)',
          value: 'expo',
        },
        {
          name: 'Taro (https://docs.taro.zone/)',
          value: 'taro',
        },
        {
          name: 'Game (https://docs.cocos.com/)',
          value: 'game-cocos',
        }
      ]
    })

    const appid = md5(uuidv4(v4options));
  
    let config =  {
      "type": "app",
      "name": appName,
      "projectname": displayName,
      "appid": appid,
      "appUrlConfig": "https://xxx.cos.ap-chengdu.myqcloud.com/assets/testMiniApps/htyanimation/app.json",
      "zipUrl": "https://xxxxx.myqcloud.com/assets/testMiniApps/xxxxx/outputs/dist.dgz"
    }

    log(`\n初始化项目. \n`)

    spinner.start()
    await execa('git', ['clone', repoUrl, appName])
    let appRootPath = '';
    try {
      if (tempType === 'taro') {
        appRootPath = `${appName}/${taroTempPath}`
        await execa('rm', ['-r', `${appName}/${expoTempPath}`])
        await execa('rm', ['-r', `${appName}/${gameTempPath}`])
      }
      if (tempType === 'expo') {
        appRootPath = `${appName}/${expoTempPath}`
        await execa('rm', ['-r', `${appName}/${taroTempPath}`])
        await execa('rm', ['-r', `${appName}/${gameTempPath}`])
      }
      if (tempType === 'game-cocos') {
        appRootPath = `${appName}/${gameTempPath}`
        await execa('rm', ['-r', `${appName}/${expoTempPath}`])
        await execa('rm', ['-r', `${appName}/${taroTempPath}`])
      }
      await execa('rm', ['-r', `${appName}/cli`])
      await execa('rm', ['-rf', `${appName}/.git`])
    } catch (err) {}
    const __TEMP_PATH__ = path.join(appRootPath, '__TEMP__');
    const pkg_path = path.join(appRootPath, './package.json');
    const dgzJosn = path.join(`${appRootPath}`, project.dgz.json)
    if (tempType === 'taro') {
      fse.closeSync(
        path.join(__TEMP_PATH__, 'taro_src'),
        path.join(appRootPath, './src') 
      )
      fse.closeSync(
        path.join(__TEMP_PATH__, 'taro.App.tsx'),
        path.join(appRootPath, './App.tsx') 
      )
      fse.closeSync(
        path.join(__TEMP_PATH__, 'taro.index.js'),
        path.join(appRootPath, './index.js') 
      )
      fse.closeSync(
        path.join(__TEMP_PATH__, 'taro.bable.config.js'),
        path.join(appRootPath, './bable.config.js') 
      )
      fse.closeSync(
        path.join(__TEMP_PATH__, 'taro.project.dgz.json'),
        path.join(appRootPath, './project.dgz.json') 
      )
      const pkg_info = fse.readJSONSync(pkg_path)
      pkg_info['scripts'] = {
        ...(pkg_info['scripts'] || {}),
        "build:weapp": "taro build --type weapp",
        "build:swan": "taro build --type swan",
        "build:alipay": "taro build --type alipay",
        "build:tt": "taro build --type tt",
        "build:h5": "taro build --type h5",
        "build:rn": "taro build --type rn",
        "build:qq": "taro build --type qq",
        "build:jd": "taro build --type jd",
        "build:quickapp": "taro build --type quickapp",
        "dev:weapp": "npm run build:weapp -- --watch",
        "dev:swan": "npm run build:swan -- --watch",
        "dev:alipay": "npm run build:alipay -- --watch",
        "dev:tt": "npm run build:tt -- --watch",
        "dev:h5": "npm run build:h5 -- --watch",
        "dev:rn": "npm run build:rn -- --watch",
        "dev:qq": "npm run build:qq -- --watch",
        "dev:jd": "npm run build:jd -- --watch",
        "dev:quickapp": "npm run build:quickapp -- --watch",
      }
      delete pkg_info['scripts']['web']
      delete pkg_info['scripts']['web:dev']
      fse.writeJSONSync(pkg_path, JSON.stringify(pkg_info, undefined, 2))
    }
    if (tempType === 'expo') {
      fse.closeSync(
        path.join(__TEMP_PATH__, 'expo_src'),
        path.join(appRootPath, './src') 
      )
      fse.closeSync(
        path.join(__TEMP_PATH__, 'expo.App.tsx'),
        path.join(appRootPath, './App.tsx') 
      )
      fse.closeSync(
        path.join(__TEMP_PATH__, 'expo.index.js'),
        path.join(appRootPath, './index.js') 
      )
      fse.closeSync(
        path.join(__TEMP_PATH__, 'expo.bable.config.js'),
        path.join(appRootPath, './bable.config.js') 
      )
      fse.closeSync(
        path.join(__TEMP_PATH__, 'expo.project.dgz.json'),
        path.join(appRootPath, './project.dgz.json') 
      )
    }
    if (tempType === 'game-cocos') {
      
    }

    fs.writeFileSync(dgzJosn, JSON.stringify(config, undefined, 2))
    console.log(dgzJosn)
    
    fse.removeSync(appRootPath)
    
    spinner.text = ''

    spinner.stop() 
    log(`${green.bold('Success!')} 创建项目 ${appName} 在 ${appRootPath} \n`)
    log(`切换到【 ${appRootPath} 】目录并运行开发`)
    log('\n')
  } catch (err) {
    console.log(err)
    log('\n')
    if (err.exitCode == 128) {
      log('Error: 目录已经存在。')
    }
    spinner.stop()
  }
}
main()