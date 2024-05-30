// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, SpriteFrame, Sprite, Label, Widget } from "cc";
import { playerData } from "../../framework/playerData";
import { util } from "../../framework/util";
import { clientEvent } from "../../framework/clientEvent";
import { uiManager } from "../../framework/uiManager";
import { audioManager } from "../../framework/audioManager";
import { constant } from "../../framework/constant";
import { gameLogic } from "../../logic/gameLogic";
import { i18n } from "../../i18nMaster/runtime-scripts/LanguageData";
const { ccclass, property } = _decorator;

@ccclass("balance")
export class balance extends Component {
    /* class member could be defined like this */
    // dummy = '';
    @property(Sprite)
    spStart: Sprite = null!;

    @property(Sprite)
    spEnd: Sprite = null!;

    @property({type: Label})
    lbCurLevel: Label = null!;

    @property({type: Label})
    lbTargetLevel: Label = null!;

    @property(Widget)
    wgMenu: Widget = null!;

    @property({type: Node, displayName: "进度项"})
    public progress:Node[] = [];

    @property(SpriteFrame)
    imgLevelFinished: SpriteFrame = null!;

    @property(SpriteFrame)
    imgLevelUnfinished: SpriteFrame = null!;

    @property(SpriteFrame)
    imgProgressNoActive: SpriteFrame = null!;

    @property(SpriteFrame)
    imgProgressActive: SpriteFrame = null!;

    @property(SpriteFrame)
    imgProgressFinished: SpriteFrame = null!;

    @property(Label)
    lbTakeCount: Label = null!;

    @property(Label)
    lbGetNormal: Label = null!;

    @property(Label)
    lbGetMulti: Label = null!;

    @property(Sprite)
    spIcon: Sprite = null!;

    @property(Node)
    nodeDouble: Node = null!;

    rewardMoney: number = 0;
    isFinishLevel: boolean = false;
    showBalanceTimes: number = 0;

    start () {
        // Your initialization goes here.

    }

    show (level: number, curProgress: number, isTakeOver: boolean,  maxProgress: number, money: number, isFinishLevel:boolean) {

        this.showBalanceTimes ++;
        //设置顶部关卡进度
        let start = curProgress;
        let end = isTakeOver ? start : start - 1;

        const len = this.progress.length;
        for (let idx = 0; idx < maxProgress; idx++) {
            if(maxProgress > len){
                break;
            }

            this.progress[idx].active = true;
            if (idx < end) {
                this.progress[idx].getComponent(Sprite)!.spriteFrame = this.imgProgressFinished;
            } else {
                this.progress[idx].getComponent(Sprite)!.spriteFrame = this.imgProgressNoActive;
            }
        }

        if (!isTakeOver) {
            this.progress[end].getComponent(Sprite)!.spriteFrame = this.imgProgressActive;
        }

        for (let idx = maxProgress; idx < this.progress.length; idx++) {
            this.progress[idx].active = false;
        }

        this.lbCurLevel.string = level.toString();
        this.lbTargetLevel.string = `${level + 1}`;

        this.isFinishLevel = isFinishLevel;
        this.spStart.spriteFrame = this.imgLevelFinished;
        if (isFinishLevel) {
            this.spEnd.spriteFrame = this.imgLevelFinished;
        } else {
            this.spEnd.spriteFrame = this.imgLevelUnfinished;
        }

        //设置完成了几个订单
        let take = end >= 0 ? end : 0;
        this.lbTakeCount.string = i18n.t("balance.你完成了%{value}个订单", { value: take});

        //设置奖励多少

        this.rewardMoney = money;
        this.lbGetNormal.string = util.formatMoney(money);
        this.lbGetMulti.string = util.formatMoney(money * 3);

        if (isFinishLevel) {
            audioManager.instance.playSound(constant.AUDIO_SOUND.WIN);
        }

        gameLogic.updateRewardIcon(constant.SHARE_FUNCTION.BALANCE, this.spIcon);

        //有30%的概率不显示该按钮
        let percent = Math.floor(Math.random() * 100);

        //触发显示
        this.nodeDouble.active = percent < 30;
    }

    onBtnGetNormalClick () {
        //普通领取
        this.rewardOver(this.rewardMoney);
    }

    onBtnGetMultiClick () {
        //3倍领取
        gameLogic.openReward(constant.SHARE_FUNCTION.BALANCE, (err)=>{
            if (!err) {
                this.rewardOver(this.rewardMoney * 3);
            }
        });
    }

    rewardOver (rewardMoney: number) {
        //如果关卡是完成的，进入下一关
        //如果关卡是未完成的，还是保留同一关

        if (this.isFinishLevel) {
            //关卡完成了，进入下一关
            gameLogic.finishBuyTask(constant.BUY_CAR_TYPE.PASS_LEVEL, playerData.instance.playerInfo.level, false);
            playerData.instance.passLevel(rewardMoney);
        } else {
            playerData.instance.updatePlayerInfo('gold', rewardMoney);
        }

        if (rewardMoney > 0) {
            gameLogic.showFlyReward(constant.REWARD_TYPE.GOLD, ()=>{
                clientEvent.dispatchEvent('updateGold');
            });
        }

        uiManager.instance.hideDialog('fight/balance');

        if (playerData.instance.playerInfo.level > 0) {
            playerData.instance.isComeFromBalance = false;
            clientEvent.dispatchEvent('newLevel', this.isFinishLevel);
        } else {
            playerData.instance.isComeFromBalance = false;
            clientEvent.dispatchEvent('newLevel', this.isFinishLevel);
        }
    }
}
