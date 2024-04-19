import { Asset, log, sys, _decorator } from "cc";
const { ccclass } = _decorator;

declare const jsb: any;
export type ValueObj = { [name: string]: string };

export type Constructor<T = unknown> = new (...args: any[]) => T;
export type AssetType<T = Asset> = Constructor<T>;
export type LoadCompleteCallback<T> = (error: Error | null, asset: T) => void;

@ccclass("configuration")
export class configuration {
    static _instance: configuration;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new configuration();
        this._instance.start();
        return this._instance;
    }

    jsonData: any = null;
    path: any = null;
    KEY_CONFIG: string = 'CarConfig';
    markSave: boolean = false;
    saveTimer: number = -1;

    start () {
        this.jsonData = {
            "userId": ""
        };

        this.path = this.getConfigPath();

        let content;
        if (sys.isNative) {
            const valueObject = jsb.fileUtils.getValueMapFromFile(this.path);

            content = valueObject[this.KEY_CONFIG];
        } else {
            content = sys.localStorage.getItem(this.KEY_CONFIG);
        }

        if (content && content.length) {
            if (content.startsWith('@')) {
                content = content.substring(1);
            }

            try {
                //初始化操作
                const jsonData = JSON.parse(content);
                this.jsonData = jsonData;
            }catch (excepaiton) {

            }

        }

        //启动无限定时器，每1秒保存一次数据，而不是无限保存数据
        this.saveTimer = setInterval(() =>{
            this.scheduleSave();
        }, 500);
    }

    setConfigDataWithoutSave (key: string, value: any) {
        const account = this.jsonData.userId;
        if (this.jsonData[account]) {
            this.jsonData[account][key] = value;
        } else {
            console.error("no account can not save");
        }
    }

    setConfigData (key: string, value: any) {
        this.setConfigDataWithoutSave(key, value);

        // this.save();
        this.markSave = true; //标记为需要存储，避免一直在写入，而是每隔一段时间进行写入
    }

    getConfigData (key: string) {
        const account = this.jsonData.userId;
        if (this.jsonData[account]) {
            const value = this.jsonData[account][key];
            return value ? value : "";
        } else {
            log("no account can not load");
            return "";
        }
    }

    setGlobalData (key:string, value: any) {
        this.jsonData[key] = value;
        this.save();
    }

    getGlobalData (key:string) {
        return this.jsonData[key];
    }

    setUserId (userId:string) {
        this.jsonData.userId = userId;
        if (!this.jsonData[userId]) {
            this.jsonData[userId] = {};
        }

        this.save();
    }

    getUserId () {
        return this.jsonData.userId;
    }

    scheduleSave () {
        if (!this.markSave) {
            return;
        }

        this.save();
    }

    /**
     * 标记为已修改
     */
    markModified () {
        this.markSave = true;
    }

    save () {
        // 写入文件
        const str = JSON.stringify(this.jsonData);

        let zipStr = str;

        this.markSave = false;

        if (!sys.isNative) {
            const ls = sys.localStorage;
            ls.setItem(this.KEY_CONFIG, zipStr);
            return;
        }

        const valueObj: ValueObj = {};
        valueObj[this.KEY_CONFIG] = zipStr;
        jsb.fileUtils.writeToFile(valueObj, this.path);

    }

    getConfigPath () {

        const platform = sys.os;

        let path = "";

        if (platform === sys.OS.WINDOWS) {
            path = "src/conf";
        } else if (platform === sys.OS.LINUX) {
            path = "./conf";
        } else {
            if (sys.isNative) {
                path = jsb.fileUtils.getWritablePath();
                path = path + "conf";
            } else {
                path = "src/conf";
            }
        }

        return path;
    }

    parseUrl (paramStr: string) {
        if (!paramStr || (typeof paramStr === 'string' && paramStr.length <= 0)) {
            // 没有带参数，直接忽略
            return;
        }

        let dictParam: any = {};
        if (typeof paramStr === 'string') {
            paramStr = paramStr.split('?')[1]; // 去除掉 ？号
            const arrParam = paramStr.split("&");
            arrParam.forEach(function (paramValue) {
                const idxEqual = paramValue.indexOf("=");
                if (idxEqual !== -1) {
                    const key = paramValue.substring(0, idxEqual);
                    dictParam[key] = paramValue.substring(idxEqual + 1);
                }
            });
        } else {
            dictParam = paramStr;
        }

        if (dictParam.action) {
            this.setGlobalData('urlParams', dictParam);
        }

        // todo：记录来源，以后用到
        if (dictParam.source) {
            this.setGlobalData('source', dictParam.source);
        }

        if (dictParam.adchannelid) {
            this.setGlobalData('adchannelid', dictParam.adchannelid);
        }
    }

    /**
     * 生成随机账户
     * @returns
     */
    public static generateGuestAccount () {
        return `${Date.now()}${0 | (Math.random() * 1000, 10)}`;
    }
}
