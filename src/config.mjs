import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';
import { CONSTANTS } from './constants.mjs';

/**
 * 项目初始化配置类
 */
export class ProjectConfig {
  constructor() {
    this.validators = {
      appName: /^([a-z]+)(-[a-z0-9]+)*$/,
      displayName: /^[\u4e00-\u9fa5a-zA-Z0-9]{2,4}$/
    };

    this.templates = {
      [CONSTANTS.TEMPLATE_TYPES.EXPO]: {
        name: 'Expo (https://docs.expo.dev/)',
        tempPath: 'mini-apps-template',
        files: {
          src: 'expo_src',
          app: 'expo.App.tsx',
          index: 'expo.index.js',
          babel: 'expo.babel.config.js',
          config: 'expo.project.dgz.json'
        }
      },
    };
  }

  validateAppName(name) {
    return this.validators.appName.test(name);
  }

  validateDisplayName(name) {
    return this.validators.displayName.test(name);
  }

  generateAppId() {
    return md5(uuidv4({
      random: [0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58, 0x36]
    }));
  }

  createProjectConfig(appName, displayName, appid) {
    return {
      type: 'app',
      name: appName,
      projectname: displayName,
      appid: appid,
      appUrlConfig: 'https://xxx.cos.ap-chengdu.myqcloud.com/assets/testMiniApps/htyanimation/app.json',
      zipUrl: 'https://xxxxx.myqcloud.com/assets/testMiniApps/xxxxx/outputs/dist.dgz'
    };
  }
}

