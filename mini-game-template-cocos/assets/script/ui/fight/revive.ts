// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Sprite, Widget } from "cc";
import { uiManager } from "../../framework/uiManager";
import { clientEvent } from "../../framework/clientEvent";
import { gameLogic } from "../../logic/gameLogic";
import { constant } from "../../framework/constant";
const { ccclass, property } = _decorator;

@ccclass("revive")
export class revive extends Component {

    @property(Sprite)
    spCountDown: Sprite = null!;  //倒计时

    @property(Sprite)
    spIcon: Sprite = null!;

    @property(Widget)
    wgMenu: Widget = null!;

    closeCb: Function | null = null;
    countDownTime = 0;
    currentTime = 0;
    isCountDowning = false;

    start () {
        // Your initialization goes here.
    }

    show (closeCallback: Function) {
        this.closeCb = closeCallback;
        //默认展示满额，倒计时下来最后为0
        this.countDownTime = 5;
        this.currentTime = 0;
        this.spCountDown.fillRange = 1;
        this.isCountDowning = true;

        gameLogic.updateRewardIcon(constant.SHARE_FUNCTION.RELIVE, this.spIcon);
    }

    onBtnReviveClick () {
        this.isCountDowning = false;

        gameLogic.openReward(constant.SHARE_FUNCTION.RELIVE, (err)=>{
            if (!err) {
                clientEvent.dispatchEvent('revive');

                uiManager.instance.hideDialog('fight/revive');
            } else {
                //失败继续倒计时
                this.isCountDowning = true;
            }
        })
    }

    onBtnSkipClick () {
        this.isCountDowning = false;

        uiManager.instance.hideDialog('fight/revive');

        this.closeCb && this.closeCb();
    }

    // update (dt: number) {
    //     if (!this.isCountDowning) {
    //         return;
    //     }

    //     this.currentTime += dt;

    //     let spare = this.countDownTime - this.currentTime;
    //     if (spare <= 0) {
    //         spare = 0;

    //         //触发倒计时结束
    //         this.isCountDowning = false;
    //         this.onBtnSkipClick();
    //     }

    //     let percent = spare / this.countDownTime; // 展示百分比
    //     this.spCountDown.fillRange = percent;


    // }
}
