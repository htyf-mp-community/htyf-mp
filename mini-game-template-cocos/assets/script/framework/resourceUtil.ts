import { _decorator, Prefab, Node, Sprite, SpriteFrame, Texture2D, Asset, error, instantiate, find, resources, isValid, assetManager, LoadCompleteCallback } from "cc";
import { AssetType } from "./configuration";
const { ccclass } = _decorator;

declare global {
    namespace globalThis {
        var LZString: any;
    }
}

interface ITextAsset{
    text?: string;
    _file?: string;
    json?: string
}



@ccclass("resourceUtil")
export class resourceUtil {
    public static loadRes<T extends Asset>(url: string, type: AssetType<T> | null, cb?: LoadCompleteCallback<T>) {
        if(type){
            resources.load(url, type, (err, res) => {
                if (err) {
                    error(err.message || err);
                    if (cb) {
                        cb(err, res);
                    }

                    return;
                }

                if (cb) {
                    cb(err, res);
                }
            });
        } else {
            resources.load(url, (err, res) => {
                if (err) {
                    error(err.message || err);
                    if (cb) {
                        cb(err, res as T);
                    }

                    return;
                }

                if (cb) {
                    cb(err, res as T);
                }
            });
        }
    }

    public static getMap(level: number, cb: (err: Error | null, textAsset: any) => void) {
        let levelStr = 'map';
        //前面补0
        if (level >= 100) {
            levelStr += level;
        } else if (level >= 10) {
            levelStr += '0' + level;
        } else {
            levelStr += '00' + level;
        }

        this.loadRes(`gamePackage/map/config/${levelStr}`, null, (err, txtAsset) => {
            if (err) {
                cb(err, txtAsset);
                return;
            }

            const txt = txtAsset as unknown as ITextAsset;
            let content = '';
            if (txt!._file) {
                if (window['LZString']) {
                    content = window['LZString'].decompressFromEncodedURIComponent(txt!._file);
                }
                const objJson = JSON.parse(content);
                cb(null, objJson);
            } else if (txt.text) {
                if (window['LZString']) {
                    content = window['LZString'].decompressFromEncodedURIComponent(txt!.text);
                }

                const objJson = JSON.parse(content);
                cb(null, objJson);
            } else if (txt!.json) {
                cb(null, txt!.json);
            } else {
                const errObj = new Error('failed');
                cb(errObj, null);
            }
        });
    }

    public static getMapObjs(type: string, arrName: Array<string>, progressCb: (completedCount: number, totalCount: number, item: any) => void | null, completeCb: (error: Error | null, asset: Prefab | Prefab[]) => void) {
        let arrUrls = [];
        for (let idx = 0; idx < arrName.length; idx++) {
            arrUrls.push(`gamePackage/map/${type}/${arrName[idx]}`)
        }

        resources.load(arrUrls, Prefab, progressCb, completeCb);
    }

    public static getUIPrefabRes(prefabPath: string, cb?: (err: Error | null, asset?: Prefab) => void) {
        this.loadRes("prefab/ui/" + prefabPath, Prefab, cb);
    }

    public static createUI(path: string, cb?: (err: Error | null, node?: Node) => void, parent?: Node | null) {
        this.getUIPrefabRes(path, (err: Error | null, prefab?: Prefab) => {
            if (err) return;
            const node = instantiate(prefab!);
            node.setPosition(0, 0, 0);
            if (!parent) {
                parent = find("Canvas");
            }

            parent!.addChild(node);
            if(cb){
                cb(null, node);
            }
        });
    }

    public static getCarsBatch(arrName: Array<string>, progressCb: (completedCount: number, totalCount: number, item: any) => void | null, completeCb: (error: Error | null, asset: Prefab) => void) {
        let arrUrls = [];
        for (let idx = 0; idx < arrName.length; idx++) {
            arrUrls.push(`prefab/car/car${arrName[idx]}`);
        }

        for (let i = 0; i < arrUrls.length; i++) {
            const url = arrUrls[i];
            if (!progressCb) {
                resources.load(url, Prefab, completeCb);
            } else {
                resources.load(url, Prefab, progressCb, completeCb);
            }
        }
    }

    public static getUICar (name:string, cb: LoadCompleteCallback<Prefab>) {
        this.loadRes(`prefab/ui/car/uiCar${name}`, Prefab, cb);
    }

    public static getCar(name: string, cb: LoadCompleteCallback<Prefab>) {
        this.loadRes(`prefab/car/car${name}`, Prefab, cb);
    }

    public static setCarIcon(name: string, sprite: Sprite, isBlack: boolean, cb: LoadCompleteCallback<SpriteFrame>) {
        let path = `gamePackage/texture/car/car${name}`;
        if (isBlack) {
            path += 'Black';
        }

        this.setSpriteFrame(path, sprite, cb);
    }

    public static getJsonData(fileName: string, cb: (err: Error | null, asset: any) => void) {
        resources.load("datas/" + fileName, (err, content) => {
            if (err) {
                error(err.message || err);
                return;
            }

            const txt = content as unknown as ITextAsset;
            if (txt.json) {
                cb(err, txt.json);
            } else {
                const errObj = new Error('failed!!!')
                cb(errObj, null);
            }
        });
    }

    public static getData(fileName: string, cb: (err: Error | null, asset: any) => void) {
        resources.load("datas/" + fileName, function (err, content) {
            if (err) {
                error(err.message || err);
                return;
            }

            const txt = content as unknown as ITextAsset;
            let text = txt!.text;
            if (!text) {
                resources.load(content.nativeUrl, (err, content) => {
                    text = content as unknown as string;
                    cb(err, text);
                });

                return;
            }

            cb(err, text);
        });
    }

    public static setSpriteFrame<T extends Asset>(path: string, sprite: Sprite, cb: LoadCompleteCallback<SpriteFrame>) {
        this.loadRes<SpriteFrame>(path + '/spriteFrame', SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error('set sprite frame failed! err:', path, err);
                cb(err, spriteFrame);
                return;
            }

            if (sprite && isValid(sprite)) {
                sprite.spriteFrame = spriteFrame;
                cb(null, spriteFrame);
            }
        });
    }

    /**
     * 根据英雄的文件名获取头像
     */
    public static setRemoteImage(url: string, sprite: Sprite, cb: LoadCompleteCallback<SpriteFrame>) {
        if (!url || !url.startsWith('http')) {
            return;
        }

        let suffix = "png";
        assetManager.loadAny([{ url: url, type: suffix }],null,  (err, image)=>{
            if (err) {
                console.error('set avatar failed! err:', url, err);
                cb(err, image);
                return;
            }

            let texture = new Texture2D();
            texture.image = image;

            let spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            cb && cb(null, spriteFrame);
        })
    }

    /**
     * 设置更多游戏的游戏图标
     */
    public static setGameIcon (game: string, sprite: Sprite, cb: LoadCompleteCallback<SpriteFrame>) {
        if (game.startsWith('http')) {
            this.setRemoteImage(game, sprite, cb);
        } else {
            this.setSpriteFrame('gamePackage/textures/icons/games/' + game, sprite, cb);
        }
    }

    /**
     * 获取顾客预制体
     *
     * @static
     * @param {string} name
     * @param {Function} cb
     * @memberof resourceUtil
     */
    public static getCustomer(name: string, cb: LoadCompleteCallback<Prefab>) {
        this.loadRes(`gamePackage/map/customer/customer${name}`, Prefab, cb);
    }

    public static setCustomerIcon(name: string, sprite: Sprite, cb: (err: Error | null) => void) {
        let path = `gamePackage/texture/head/head${name}`;

        this.setSpriteFrame(path, sprite, cb);
    }

    public static getEffect(name: string, cb: LoadCompleteCallback<Prefab>) {
        this.loadRes(`prefab/effect/${name}`, Prefab, cb);
    }
}
