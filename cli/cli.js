#!/usr/bin/env node

import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import { Command } from 'commander'
import select from '@inquirer/select'
import { input } from '@inquirer/prompts';
import {execa, execaCommand} from 'execa'
import ora from 'ora'
import childProcess from 'child_process'

const log = console.log
const program = new Command()
const green = chalk.green

const repoUrl = 'https://github.com/htyf-mp-community/htyf-mp.git'

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
    text: 'Creating codebase'
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
        message: '输入应用程序名称',
        default: 'my-htyf-mp',
        validate: d => {
         if(!kebabRegez.test(d)) {
          return '请以my-app-name格式输入您的应用程序名称'
         }
         return true
        }
      })
    }
  
    const tempType = await select({
      message: '请选择模板类型?',
      choices: [
        {
          name: 'Taro',
          value: 'taro',
        },
        {
          name: 'ReactNative',
          value: 'react-native',
        }
      ]
    })

    const appid = '';
  
    let config =  {
      "type": "app",
      "name": appName,
      "appid": appid,
      "appUrlConfig": "https://xxx.cos.ap-chengdu.myqcloud.com/assets/testMiniApps/htyanimation/app.json",
      "zipUrl": "https://xxxxx.myqcloud.com/assets/testMiniApps/xxxxx/outputs/dist.dgz"
    }



    log(`\n初始化项目. \n`)

    spinner.start()
    await execa('git', ['clone', repoUrl, appName])
    try {
      if (tempType === 'taro') {
        await execa('rm', ['-r', `${appName}/mini-apps-template-taro`])
      }
      if (tempType === 'react-native') {
        await execa('rm', ['-r', `${appName}/mini-apps-template-rn`])
      }
      await execa('rm', ['-r', `${appName}/cli`])
      await execa('rm', ['-rf', `${appName}/.git`])
    } catch (err) {}
    
    if (tempType === 'taro') {
      fs.writeFileSync(`${appName}/mini-apps-template-taro/project.dgz.json`, JSON.stringify(config, undefined, 2))
    }
    if (tempType === 'react-native') {
      fs.writeFileSync(`${appName}/mini-apps-template-rn/project.dgz.json`, JSON.stringify(config, undefined, 2))
    }

    
    spinner.text = ''
    let serverStartCommand = ''

    spinner.stop() 
    log(`${green.bold('Success!')} Created ${appName} at ${process.cwd()} \n`)
    log(`切换到${appName}目录并运行开发`)
  } catch (err) {
    log('\n')
    if (err.exitCode == 128) {
      log('Error: 目录已经存在。')
    }
    spinner.stop()
  }
}
main()