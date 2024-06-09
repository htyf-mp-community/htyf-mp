// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Label, Sprite } from "cc";
import { gameLogic } from "../../logic/gameLogic";
import { uiManager } from "../../framework/uiManager";
import { util } from "../../framework/util";
import { constant } from "../../framework/constant";
import { playerData } from "../../framework/playerData";
import { clientEvent } from "../../framework/clientEvent";
const { ccclass, property } = _decorator;

@ccclass("onlineDouble")
export class onlineDouble extends Component {
    rewardMoney: number = 0;
    overCallback: Function = null;

    @property(Label)
    lbGoldNormal: Label = null;

    @property(Label)
    lbGoldMulti: Label = null;

    @property(Sprite)
    spIcon: Sprite = null;

    start () {
        // Your initialization goes here.
    }

    show (money: number, cb: Function) {
        this.rewardMoney = money;
        this.overCallback = cb;

        this.lbGoldNormal.string = util.formatMoney(money);

        this.lbGoldMulti.string = util.formatMoney(money * 3);

        gameLogic.updateRewardIcon(constant.SHARE_FUNCTION.ONLINE, this.spIcon);
    }

    onBtnGetNormalClick () {
        //普通领取
        this.rewardOver(this.rewardMoney);
    }

    onBtnGetMultiClick () {
        //3倍领取
        gameLogic.openReward(constant.SHARE_FUNCTION.ONLINE, (err)=>{
            if (!err) {
                this.rewardOver(this.rewardMoney * 3);
            }
        });
    }

    rewardOver (money: number) {
        // gameLogic.addGold(money);

        //TODO 触发特效
        playerData.instance.updatePlayerInfo('gold', money);
        uiManager.instance.hideDialog('main/onlineDouble');

        gameLogic.showFlyReward(constant.REWARD_TYPE.GOLD, ()=>{
            clientEvent.dispatchEvent('updateGold');
        });

        if (this.overCallback) {
            this.overCallback();
        }
    }

    onBtnCloseClick () {
        uiManager.instance.hideDialog('main/onlineDouble');
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
