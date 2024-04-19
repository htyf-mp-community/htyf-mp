// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, SpriteFrame, Sprite, Label, Node, Vec3, Animation } from "cc";
import { uiManager } from '../../framework/uiManager';
import { resourceUtil } from '../../framework/resourceUtil';
import { playerData } from '../../framework/playerData';
import { constant } from '../../framework/constant';
import { localConfig } from '../../framework/localConfig';
import { gameLogic } from '../../logic/gameLogic';
import { clientEvent } from '../../framework/clientEvent';
import { poolManager } from "../../framework/poolManager";
import { i18n } from "../../i18nMaster/runtime-scripts/LanguageData";

const { ccclass, property } = _decorator;

@ccclass("showReward")
export class showReward extends Component {

    //金币图标
    @property(SpriteFrame)
    sfGold: SpriteFrame = null!;

    //奖励图标
    @property(Sprite)
    spIcon: Sprite = null!;

    //奖励数量
    @property(Label)
    lbRewardValue: Label = null!;

    //文字提示
    @property(Label)
    lbTips: Label = null!;

    //标题
    @property(Label)
    lbTitle: Label = null!;

    @property(Label)
    lbImmediateBtn: Label = null!;

    @property(Node)
    ndCarParent: Node = null!;

    //双倍领取按钮
    @property(Node)
    ndBtnDouble: Node = null!;

    //普通领取按钮
    @property(Node)
    ndBtnNormal: Node = null!;

    //立即领取按钮
    @property(Node)
    ndBtnImmediately: Node = null!;

    @property(Animation)
    aniReward: Animation = null!;

    isDouble = false;
    callback: Function | null = null;
    isLast = false;
    rewardType = 0;
    amount = 0;
    itemInfo: any;
    _isHadCar = false;
    currentCar: Node | null = null;
    carDegree: number = 0;
    rotateSpeed: number = 30;

    start() {
        // Your initialization goes here.
    }

    /**
     *
     *
     * @param {*} itemInfo
     * @param {boolean} isDouble 是“双倍领取、普通领取”组合或者单独一个“立即领取”
     * @param {string} title
     * @param {Function} callback
     * @param {string} [tips]
     * @memberof showReward
     */
    show(itemInfo: any, isDouble: boolean, title: string, callback: Function, tips?: string, txtImmediateBtn?: string) {
        this.itemInfo = itemInfo;
        this.rewardType = itemInfo.rewardType;
        this.amount = itemInfo.amount;

        this.ndBtnDouble.active = isDouble;
        this.ndBtnNormal.active = isDouble;
        this.ndBtnImmediately.active = !isDouble;

        this.lbTitle.string = title;
        this.lbRewardValue.string = itemInfo.rewardType === constant.REWARD_TYPE.CAR ? '' : String(this.amount);
        this.callback = callback;

        if (tips) {
            this.lbTips.node.active = true;
            this.lbTips.string = tips;
        } else {
            this.lbTips.node.active = false;
        }

        this.showRewardPage();

        this.aniReward.play('rewardShow');
        this.aniReward.once(Animation.EventType.FINISHED, ()=>{
            this.aniReward.play('rewardIdle');
        }, this);

        if (txtImmediateBtn) {
            this.lbImmediateBtn.string = txtImmediateBtn;
        } else {
            this.lbImmediateBtn.string = i18n.t('balance.receiveImmediately');
        }
    }

    /**
     * 设置奖励界面图标
     */
    showRewardPage() {
        if (this.currentCar) {
            poolManager.instance.putNode(this.currentCar);
            this.currentCar = null;
        }

        switch (this.rewardType) {
            case constant.REWARD_TYPE.DIAMOND:
                break;
            case constant.REWARD_TYPE.GOLD:
                this.spIcon.spriteFrame = this.sfGold;
                this.spIcon.node.active = true;
                break;
            case constant.REWARD_TYPE.CAR:
                this.spIcon.node.active = false;

                let targetCar = localConfig.instance.queryByID('car', this.itemInfo.ID);
                let carModel = targetCar.model;
                resourceUtil.getUICar(carModel, (err, prefab)=>{
                    if (err) {
                        console.error(err);
                        return;
                    }

                    this.currentCar = poolManager.instance.getNode(prefab, this.ndCarParent);
                    this.carDegree = 0;
                })
                // resourceUtil.setCarIcon(carModel, this.spIcon, false, ()=>{});
                break;
        }
    }

    onBtnNormalClick() {
        this.addReward();
    }

    onBtnDoubleClick() {
        gameLogic.openReward(constant.SHARE_FUNCTION.SIGNIN, (err)=>{
            if (!err) {
                this.amount *= 2;
                this.addReward();
            }
        })
    }

    onBtnImmediatelyClick () {
        this.addReward();
    }

    addReward() {
        switch (this.rewardType) {
            case constant.REWARD_TYPE.DIAMOND:
                break;
            case constant.REWARD_TYPE.GOLD:
                // gameLogic.addGold(this.amount);
                playerData.instance.updatePlayerInfo('gold', this.amount);
                gameLogic.showFlyReward(constant.REWARD_TYPE.GOLD, ()=>{
                    clientEvent.dispatchEvent('updateGold');
                });
                break;
            case constant.REWARD_TYPE.CAR:
                gameLogic.buyCar(this.itemInfo.ID);
                break;
        }

        uiManager.instance.hideDialog('common/showReward');
        this.callback &&  this.callback();
    }

    update (deltaTime: number) {
         //旋转展示车辆
         if (this.currentCar) {
            this.carDegree -= deltaTime * this.rotateSpeed;

            if (this.carDegree <= -360) {
                this.carDegree += 360;
            }

            this.currentCar.eulerAngles = new Vec3(0, this.carDegree, 0);
        }
    }
}
