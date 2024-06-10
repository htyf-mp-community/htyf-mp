// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, SpriteFrame, Node } from "cc";
import { carManager } from "../../fight/carManager";
import { gameLogic } from "../../logic/gameLogic";
import { loading } from "../common/loading";
import { clientEvent } from "../../framework/clientEvent";
const { ccclass, property } = _decorator;

@ccclass("fightCanvas")
export class fightCanvas extends Component {
    /* class member could be defined like this */
    // dummy = '';

    @property(carManager)
    carManager: carManager = null!;

    @property(SpriteFrame)
    imgShare: SpriteFrame = null!;

    @property(SpriteFrame)
    imgVideo: SpriteFrame = null!;

    @property(loading)
    loadingUI: loading = null!;

    @property(Node)
    tip: Node = null;

    curProgress: number = 50;
    isFirstLoad: boolean = true; //首次加载
    isTouching: boolean = false; //是否正在点击中

    start () {
        gameLogic.imgAd = this.imgVideo;
        gameLogic.imgShare = this.imgShare;

        //首次进来，起始50%（前面为登录加载）
        this.loadingUI.show(this.curProgress);

        // Your initialization goes here.
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onEnable () {
        clientEvent.on('updateLoading', this.updateLoadingProgress, this);
        clientEvent.on('showGuide', this.showGuide, this);
    }

    onDisable () {
        clientEvent.off('updateLoading', this.updateLoadingProgress, this);
        clientEvent.off('showGuide', this.showGuide, this);
    }

    onTouchStart () {
        this.isTouching = true;
        this.tip.active = false;
        this.carManager.controlMainCar(true);
    }

    onTouchEnd () {
        this.isTouching = false;
        this.carManager.controlMainCar(false);
    }

    showGuide (isShow: boolean) {
        if (isShow && this.isTouching) {
            //异步执行，使引导正常，因为
            this.scheduleOnce(()=>{
                this.onTouchStart();
            }, 0);
        }
    }

    updateLoadingProgress (progress: number, tips: string) {
        if (!this.isFirstLoad) {
            this.curProgress += progress;
        } else {
            this.curProgress += Math.floor(progress / 2);  //首次加载是跟登录一块的，这样起始是50%
        }


        this.loadingUI.updateProgress(this.curProgress, tips);
    }

    loadNewLevel () {
        this.loadingUI.node.active = true;
        this.curProgress = 0;
        this.isFirstLoad = false;
    }

    finishLoading () {
        this.loadingUI.node.active = false;
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
