// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator } from "cc";
import { oneToMultiListener } from "./oneToMultiListener";
const { ccclass, property } = _decorator;

@ccclass("clientEvent")
export class clientEvent extends oneToMultiListener {
    static handlers = {};

    // this.setSupportEventList()
    
    // constructor () {
    //     super();
        
    //     this._EVENT_TYPE = [
    //         "testEvent",
    //         "onAppShow",
    //         "onNetworkConnect",
    //         "hideNetLoading",
    //         "showNetLoading",
    //         "showWaiting",          //展示waiting界面
    //         "hideWaiting",          //隐藏waiting界面
    //         "showSharedDialog",      //显示单例界面
    //         "hideSharedDialog",     //隐藏单例弹窗
    //         "showTips",
    //         "showGetMoneyTips",
    //         "activeScene",          //设置场景是否可用
    //         "pushToPopupSeq",           //创建对话框弹出队列
    //         "shiftFromPopupSeq",            //从弹出框队列移除
    //         "onSceneChanged",


    //         //游戏逻辑相关
    //         "startGame",            //开始游戏
    //         "gameOver",             //游戏结束
    //     ];

    //     this.setSupportEventList(this._EVENT_TYPE);
    // }

    // start () {
    //     // Your initialization goes here.
    // }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
