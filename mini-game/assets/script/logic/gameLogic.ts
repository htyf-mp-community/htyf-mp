// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Sprite, SpriteFrame, Node } from "cc";
import { playerData } from "../framework/playerData";
import { clientEvent } from "../framework/clientEvent";
import { configuration } from "../framework/configuration";
import { constant } from "../framework/constant";
import { resourceUtil } from "../framework/resourceUtil";
import { flyReward } from "../ui/main/flyReward";
import { uiManager } from "../framework/uiManager";
const { ccclass } = _decorator;

@ccclass("gameLogic")
export class gameLogic {
    /* class member could be defined like this */
    // dummy = '';

    public static imgAd: SpriteFrame | null = null;
    public static imgShare: SpriteFrame | null = null;

    public static addGold (gold: number) {
        playerData.instance.updatePlayerInfo('gold', gold);

        clientEvent.dispatchEvent('updateGold');
    }

    public static useCar (carId: number) {
        playerData.instance.useCar(carId);

        clientEvent.dispatchEvent('updateCar');
    }

    public static buyCar (carId: number) {
        playerData.instance.buyCar(carId);
        clientEvent.dispatchEvent('buyCar');
    }

    public static isVibrateOpen () {
        let isVibrateOpen = configuration.instance.getGlobalData('vibrate');
        if (isVibrateOpen === undefined || isVibrateOpen === null) {
            isVibrateOpen = true; //默认是打开的状态
        }

        return isVibrateOpen;
    }

    public static getOpenRewardType (funStr: string, callback: Function, index?: number) {
        callback(null, constant.OPEN_REWARD_TYPE.NULL);
    }

    public static checkIsByVideoAds () {
        return false;
    }

    /**
     * 根据功能设置图标对应展示
     *
     * @static
     * @param {string} funStr
     * @param {Sprite} spIcon
     * @param {Function} [callback]
     * @param {SpriteFrame} [imgAd]
     * @param {SpriteFrame} [imgShare]
     * @memberof gameLogic
     */
    public static updateRewardIcon (funStr: string, spIcon: Sprite, callback?: Function, imgAd?: SpriteFrame, imgShare?: SpriteFrame) {
        this.getOpenRewardType(funStr, (err: Error | null, type: number)=>{
            switch (type) {
                case constant.OPEN_REWARD_TYPE.AD:
                    spIcon.node.active = true;
                    if (imgAd) {
                        spIcon.spriteFrame = imgAd;
                    } else {
                        spIcon.spriteFrame = this.imgAd;
                    }
                    break;
                case constant.OPEN_REWARD_TYPE.SHARE:
                    spIcon.node.active = true;
                    if (imgShare) {
                        spIcon.spriteFrame = imgShare;
                    } else {
                        spIcon.spriteFrame = this.imgShare;
                    }
                    break;
                case constant.OPEN_REWARD_TYPE.NULL:
                    spIcon.node.active = false;
                    break;
            }

            if (callback) {
                callback(err, type);
            }
        })
    }

    public static finishBuyTask (type: number, value: number, isAdd ?: boolean) {
        playerData.instance.finishBuyTask(type, value, isAdd);
        clientEvent.dispatchEvent('updateBuyTask');
    }

    public static openReward (funStr: string, callback: (...args: any[]) => void) {
        callback && callback(null);
    }

    /**
     * 登陆成功后会回调该方法,类似于一个声明周期或者状态
     */
    public static afterLogin () {
        if (!playerData.instance.isNewBee) {
            this.checkSignIn();
        }
    }

    /**
     * 如果今天还未签到则弹出
     */
    public static checkSignIn () {
        if (playerData.instance.playerInfo.level === 1) {
            //第一关未通关则不跳签到界面
            return;
        }
        playerData.instance.updateSignInCurrentDay();
        if (!playerData.instance.getSignInReceivedInfo().isTodayReceived) {
            uiManager.instance.pushToPopupSeq('signIn/signIn', 'signIn', {});
        }
    }

    public static showFlyReward(rewardType?: number, callback?: Function) {
        resourceUtil.createUI('common/flyReward', (err, node)=>{
            if (err) {
                if (callback) {
                    callback();
                }
                return;
            }

            let reward = node!.getComponent(flyReward)!;
            // reward.setInfo(rewardType === constant.REWARD_TYPE.GOLD);
            reward.setEndListener(callback);
        });
    }
}
