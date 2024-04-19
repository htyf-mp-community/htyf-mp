import { lottery } from './lottery';
// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, SpriteFrame, Sprite, Label } from "cc";
import { resourceUtil } from "../../framework/resourceUtil";
import { localConfig } from "../../framework/localConfig";
import { playerData } from "../../framework/playerData";
import { uiManager } from "../../framework/uiManager";
import { constant } from "../../framework/constant";
import { i18n } from "../../i18nMaster/runtime-scripts/LanguageData";
const { ccclass, property } = _decorator;

@ccclass("lotteryItem")
export class lotteryItem extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property(SpriteFrame)
    imgGold: SpriteFrame = null!;

    @property(Sprite)
    spItem: Sprite = null!;

    @property(Label)
    lbValue: Label = null!;
    carInfo: any;

    start () {
        // Your initialization goes here.
    }

    show (car: string) {
        this.carInfo = localConfig.instance.queryByID('car', car);
        resourceUtil.setCarIcon(this.carInfo.model, this.spItem, false, ()=>{

        });
    }

    showReward (lottery: any) {
        console.log(this.carInfo.ID);
        if (!playerData.instance.hasCar(this.carInfo.ID)) {
            //该车还没有，可以直接追加
            //调用奖励界面加车
            let rewardInfo = {
                rewardType: constant.REWARD_TYPE.CAR,
                amount: 1,
                ID: this.carInfo.ID
            };

            uiManager.instance.showDialog('common/showReward', [rewardInfo, false, i18n.t('showReward.title'), ()=>{
                lottery.receiveCarTimes += 1;
            }]);
        } else {
            //没有加车,转换成金币
            let titleInfo = {
                rewardType: constant.REWARD_TYPE.GOLD,
                amount: constant.LOTTERY.EXCHANGE,
                ID: this.carInfo.ID
            };
            uiManager.instance.showDialog('common/showReward', [titleInfo, false, i18n.t('showReward.title'), ()=>{

            }, i18n.t("showReward.alreadyHadCar")]);
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
