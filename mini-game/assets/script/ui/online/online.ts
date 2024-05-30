// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Sprite, Label } from "cc";
import { playerData } from "../../framework/playerData";
import { util } from "../../framework/util";
import { constant } from "../../framework/constant";
import { gameLogic } from "../../logic/gameLogic";
import { uiManager } from "../../framework/uiManager";
import { clientEvent } from "../../framework/clientEvent";
const { ccclass, property } = _decorator;

@ccclass("online")
export class online extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property(Sprite)
    spTimeProgress: Sprite = null;     //累积时间进度

    @property(Sprite)
    perTimeProgress: Sprite = null;    //每次的时间进度，使用sprite的FillRange来修改

    @property(Label)
    lbGold: Label = null;

    currentTime: number = 0;
    isOverflow: boolean = false;
    currentGold: number = 0;

    start () {
        // Your initialization goes here.
    }

    onEnable () {
        //触发界面刷新
        this.refresh();
    }

    refresh () {
        //每圈计时
        this.currentTime = 0;
        this.perTimeProgress.fillRange = 0;

        let lastTime = playerData.instance.getLastOnlineRewardTime();
        let offsetTime = Math.floor((playerData.instance.getCurrentTime() - lastTime) / 1000);
        offsetTime = offsetTime > 0 ? offsetTime : 0;
        offsetTime = offsetTime < constant.ONLINE.MAX_TIME ? offsetTime : constant.ONLINE.MAX_TIME;
        this.isOverflow = offsetTime === constant.ONLINE.MAX_TIME;


        //设置当前收益
        this.currentGold = Math.floor(offsetTime * constant.ONLINE.PROFIT_PER_SECOND);
        this.lbGold.string = util.formatMoney(this.currentGold);

        //进度条
        let percent = offsetTime / constant.ONLINE.MAX_TIME;
        percent = percent > 1 ? 1 : percent;
        this.spTimeProgress.fillRange = percent;


    }

    clear () {
        this.currentGold = 0;
        this.lbGold.string = '0';
        this.spTimeProgress.fillRange = 0;
        playerData.instance.updateLastOnlineRewardTime(this.currentTime);

        this.isOverflow = false;
    }

    onBtnOnlineClick () {
        if (this.currentGold <= 0) {
            return;
        }

        let pro = this.spTimeProgress.fillRange;
        //如果超过了50%要问是否要双倍，否则直接领取
        if (pro >= 0.5) {
            //显示弹窗
            uiManager.instance.showDialog('main/onlineDouble', [this.currentGold, ()=>{
                this.clear();
            }]);
        } else {
            // gameLogic.addGold(this.currentGold);

            playerData.instance.updatePlayerInfo('gold', this.currentGold);

            //播放特效
            //....
            gameLogic.showFlyReward(constant.REWARD_TYPE.GOLD, ()=>{
                clientEvent.dispatchEvent('updateGold');
            });

            this.clear();
        }
    }

    update (deltaTime: number) {
        // Your update function goes here.
        if (!this.isOverflow) {
            this.currentTime += deltaTime;

            if (this.currentTime > constant.ONLINE.TIME_PER_CIRCLE) {
                this.refresh();
            } else {
                let progress = this.currentTime / constant.ONLINE.TIME_PER_CIRCLE;
                this.perTimeProgress.fillRange = progress;
            }
        }
    }
}
