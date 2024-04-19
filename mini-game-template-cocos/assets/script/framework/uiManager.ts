// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, find, isValid } from "cc";
import { resourceUtil } from "./resourceUtil";
import { poolManager } from "./poolManager";
import { tips } from "../ui/common/tips";
const { ccclass, property } = _decorator;

const SHOW_STR_INTERVAL_TIME = 800;

interface IPanel extends Component {
    show?: Function;
    hide?: Function;
}

@ccclass("uiManager")
export class uiManager {

    dictSharedPanel: { [path: string]: Node } = {}
    dictLoading: { [path: string]: boolean } = {};
    arrPopupDialog: {
        panelPath: string,
        scriptName?: string,
        param: any,
        isShow: boolean
    }[] = [];
    showTipsTime: number = 0


    static _instance: uiManager;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new uiManager();
        return this._instance;
    }


    /**
     * 显示单例界面
     * @param {String} panelPath
     * @param {Array} args
     * @param {Function} cb 回调函数，创建完毕后回调
     */
    showDialog (panelPath: string, args?: any, cb?: Function) {
        if (this.dictLoading[panelPath]) {
            return;
        }

        let idxSplit = panelPath.lastIndexOf('/');
        let scriptName = panelPath.slice(idxSplit + 1);

        if (!args) {
            args = [];
        }

        if (this.dictSharedPanel.hasOwnProperty(panelPath)) {
            let panel = this.dictSharedPanel[panelPath];
            if (isValid(panel)) {
                panel.parent = find("Canvas");
                panel.active = true;
                let script = panel.getComponent(scriptName) as IPanel;
                if (script.show) {
                    script.show.apply(script, args);
                }

                cb && cb(script);

                return;
            }
        }

        this.dictLoading[panelPath] = true;
        resourceUtil.createUI(panelPath, (err, node) => {
            //判断是否有可能在显示前已经被关掉了？
            let isCloseBeforeShow = false;
            if (!this.dictLoading[panelPath]) {
                //已经被关掉
                isCloseBeforeShow = true;
            }

            this.dictLoading[panelPath] = false;
            if (err) {
                console.error(err);
                return;
            }

            // node.zIndex = 100;
            this.dictSharedPanel[panelPath] = node!;

            let script = node!.getComponent(scriptName)! as IPanel;
            if (script.show) {
                script.show.apply(script, args);
            }

            cb && cb(script);

            if (isCloseBeforeShow) {
                //如果在显示前又被关闭，则直接触发关闭掉
                this.hideDialog(panelPath);
            }
        });
    }

    /**
     * 隐藏单例界面
     * @param {String} panelPath
     * @param {fn} callback
     */
    hideDialog (panelPath: string, callback?: Function) {
        if (this.dictSharedPanel.hasOwnProperty(panelPath)) {
            let panel = this.dictSharedPanel[panelPath];
            if (panel && isValid(panel)) {
                // let ani = panel.getComponent('animationUI');
                // if (ani) {
                //     ani.close(() => {
                //         panel.parent = null;
                //         if (callback && typeof callback === 'function') {
                //             callback();
                //         }
                //     });
                // } else {
                    panel.parent = null;
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                // }
            } else if (callback && typeof callback === 'function') {
                callback();
            }
        }

        this.dictLoading[panelPath] = false;
    }

    /**
     * 将弹窗加入弹出窗队列
     * @param {string} panelPath
     * @param {string} scriptName
     * @param {*} param
     */
    pushToPopupSeq (panelPath: string, scriptName: string, param: any) {
        let popupDialog = {
            panelPath: panelPath,
            scriptName: scriptName,
            param: param,
            isShow: false
        };

        this.arrPopupDialog.push(popupDialog);

        this.checkPopupSeq();
    }

    /**
     * 将弹窗加入弹出窗队列
     * @param {number} index
     * @param {string} panelPath
     * @param {string} scriptName
     * @param {*} param
     */
    insertToPopupSeq (index: number, panelPath: string, param: any) {
        let popupDialog = {
            panelPath: panelPath,
            param: param,
            isShow: false
        };

        this.arrPopupDialog.splice(index, 0, popupDialog);
        //this.checkPopupSeq();
    }

    /**
     * 将弹窗从弹出窗队列中移除
     * @param {string} panelPath
     */
    shiftFromPopupSeq (panelPath: string) {
        this.hideDialog(panelPath, () => {
            if (this.arrPopupDialog[0] && this.arrPopupDialog[0].panelPath === panelPath) {
                this.arrPopupDialog.shift();
                this.checkPopupSeq();
            }
        })
    }

    /**
     * 检查当前是否需要弹窗
     */
    checkPopupSeq () {
        if (this.arrPopupDialog.length > 0) {
            let first = this.arrPopupDialog[0];

            if (!first.isShow) {
                this.showDialog(first.panelPath, first.param);
                this.arrPopupDialog[0].isShow = true;
            }
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    /**
     * 显示提示
     * @param {String} content
     * @param {Function} cb
     */
    showTips (content: string, cb?: Function) {
        var now = Date.now();
        if (now - this.showTipsTime < SHOW_STR_INTERVAL_TIME) {
            var spareTime = SHOW_STR_INTERVAL_TIME - (now - this.showTipsTime);
            const self = this;
            setTimeout(function (tipsLabel, callback) {
                self._showTipsAni(tipsLabel, callback);
            }.bind(this, content, cb), spareTime);

            this.showTipsTime = now + spareTime;
        } else {
            this._showTipsAni(content, cb);
            this.showTipsTime = now;
        }
    }

    /**
     * 内部函数
     * @param {String} content
     * @param {Function} cb
     */
    _showTipsAni(content: string, cb?: Function) {
        //todo 临时添加方案，后期需要将这些代码移到具体界面
        resourceUtil.getUIPrefabRes('common/tips', (err, prefab) => {
            if (err) {
                return;
            }

            let tipsNode = poolManager.instance.getNode(prefab!, find("Canvas")!) as Node;
            let tipScript = tipsNode.getComponent(tips)!;
            tipScript.show(content, cb);
        });
    }
}
