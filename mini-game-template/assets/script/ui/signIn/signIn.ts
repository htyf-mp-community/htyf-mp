// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, SpriteFrame, Sprite, Widget, Node, Prefab, Button, instantiate } from "cc";
import { localConfig } from '../../framework/localConfig';
import { playerData } from '../../framework/playerData';
import { constant } from '../../framework/constant';
import { uiManager } from "../../framework/uiManager";
import { signInItem } from "./signInItem";
import { gameLogic } from "../../logic/gameLogic";
import { util } from "../../framework/util";
import { clientEvent } from "../../framework/clientEvent";
import { i18n } from "../../i18nMaster/runtime-scripts/LanguageData";


const { ccclass, property } = _decorator;

@ccclass("signIn")
export class signIn extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    //普通领取按钮
    @property(Node)
    ndBtnNormal: Node = null!;

    //双倍领取按钮
    @property(Node)
    ndBtnDouble: Node = null!;

    //领取按钮
    @property(Node)
    ndBtnReceive: Node = null!;

    // @property(Node)
    // ndReceiveIcon: Node = null!;

    //关闭按钮
    @property(Node)
    ndBtnClose: Node = null!;

    //暂不领取按钮
    // @property(Node)
    // ndBtnNotYet: Node = null!;

    //双倍领取按钮上图标
    @property(Sprite)
    spDoubleBtnIcon: Sprite = null!;

    // @property(Sprite)
    // spReceiveBtnIcon: Sprite = null!;

    //双倍领取按钮背景
    @property(SpriteFrame)
    sfBlue: SpriteFrame = null!;

    //双倍领取按钮背景
    @property(SpriteFrame)
    sfGray: SpriteFrame = null!;

    //视频按钮图片
    @property(SpriteFrame)
    sfVideo: SpriteFrame = null!;

    //分享图片
    @property(SpriteFrame)
    sfShare: SpriteFrame = null!;

    //天数列表
    @property(Node)
    arrNodeDay: Node[] = [];

    //子预制件
    @property(Prefab)
    pbSignInItem: Prefab = null!;

    //当前日期
    currentDay = 0;

    //已经领取的日期数组
    arrReceived: number[] = [];

    //已经补签后可领取的日期数组
    arrAfterFillSignIn: number[] = [];

    //当天是否已经领取
    isTodayReceived = false;

    //是否领完当前可以领取的奖励
    isAllReceived = false;

    //存放字节点脚本的集合
    arrSignInItemScript: signInItem[] = [];

    currentReward: any;

    currentRewardType: any;

    //当天奖励如果是车，则判断下该车是否已拥有
    isHadCar: any;

    //签到创建时间
    createDate: any;

    //获得到指定车辆的时间
    getCarDate: any;

    start () {
        // Your initialization goes here.
    }

    show () {
        playerData.instance.updateSignInCurrentDay();

        let signInInfo = playerData.instance.playerInfo.signInInfo;
        this.currentDay = signInInfo.currentDay;
        this.arrReceived = signInInfo.receivedDays;
        this.arrAfterFillSignIn = signInInfo.afterFillSignInDays;

        gameLogic.updateRewardIcon(constant.SHARE_FUNCTION.SIGNIN, this.spDoubleBtnIcon);
        // gameLogic.updateRewardIcon(constant.SHARE_FUNCTION.SIGNIN, this.spReceiveBtnIcon);

        this.showSignInInfo();

        this.setButtonStyle();

        // this.ndReceiveIcon.active = true;
    }

    /**
     * 分为“双倍领取-普通领取-关闭”， “领取-暂不领取-关闭”两种形式,当天奖励为金币显示第一种，为车辆显示第二种
     */
    setButtonStyle () {
        //如果今天领取完了就将双倍领取按钮或领取按钮置灰
        let receiveStatus = playerData.instance.getSignInReceivedInfo();
        this.isTodayReceived = receiveStatus.isTodayReceived;
        this.isAllReceived = receiveStatus.isAllReceived;
        this.ndBtnDouble.getComponent(Sprite)!.spriteFrame = this.isTodayReceived ? this.sfGray : this.sfBlue;
        this.ndBtnDouble.getComponent(Button)!.interactable = !this.isTodayReceived;
        this.ndBtnReceive.getComponent(Sprite)!.spriteFrame = this.isTodayReceived ? this.sfGray : this.sfBlue;
        this.ndBtnReceive.getComponent(Button)!.interactable = !this.isTodayReceived;

        let arrSignIn = localConfig.instance.getTableArr("signIn");
        this.currentReward = arrSignIn[this.currentDay - 1];
        this.currentRewardType = this.currentReward.rewardType;

        if (this.currentRewardType === constant.REWARD_TYPE.CAR) {
            if (playerData.instance.isHadCarAndDuringPeriod(this.currentReward.amount)) {
                this.ndBtnDouble.active = true;
                this.ndBtnReceive.active = false;
                this.ndBtnNormal.active = !this.isTodayReceived;
                // this.ndBtnNotYet.active = false;
            } else {
                this.ndBtnDouble.active = false;
                this.ndBtnReceive.active = true;
                this.ndBtnNormal.active = false;
                // this.ndBtnNotYet.active = !this.isTodayReceived;
            }
        } else {
            this.ndBtnDouble.active = true;
            this.ndBtnReceive.active = false;
            this.ndBtnNormal.active = !this.isTodayReceived;
            // this.ndBtnNotYet.active = false;
        }
    }

    showSignInInfo () {
        this.arrSignInItemScript = [];
        let arrSignIn = localConfig.instance.getTableArr("signIn");

        for (let idx = 0; idx < arrSignIn.length; idx++) {
            let day: number = arrSignIn[idx].ID;
            let isReceived = this.arrReceived.includes(day) ? true : false;//从签到数组中判断是否已经领取
            if (day <= this.currentDay) {
                //状态设置为已领取或者可领取
                arrSignIn[idx].status = isReceived ? constant.SIGNIN_REWARD_STATUS.RECEIVED : constant.SIGNIN_REWARD_STATUS.RECEIVABLE;
                if (arrSignIn[idx].status === constant.SIGNIN_REWARD_STATUS.RECEIVABLE && day < this.currentDay) {
                    arrSignIn[idx].status = constant.SIGNIN_REWARD_STATUS.FILL_SIGNIN;
                    if (this.arrAfterFillSignIn.includes(day)) {
                        arrSignIn[idx].status = constant.SIGNIN_REWARD_STATUS.AFTER_FILL_SIGNIN;
                    }
                }
            } else {
                //不可领取
                arrSignIn[idx].status = constant.SIGNIN_REWARD_STATUS.UNRECEIVABLE;
            }
            // 确定布局后，设置位置
            let node = this.arrNodeDay[idx];
            let signInItemNode: Node | null = null;
            if (!node.getChildByName('signInItem')) {
                signInItemNode = instantiate(this.pbSignInItem);
                node.addChild(signInItemNode);
            } else {
                signInItemNode = node.getChildByName('signInItem')!;
            }
            let signInItemScript = signInItemNode.getComponent(signInItem)!;
            signInItemScript.init(arrSignIn[idx], this);

            if (!this.arrSignInItemScript.includes(signInItemScript)) {
                this.arrSignInItemScript.push(signInItemScript);
            }
        };
    }

    /**
     * 领取奖励
     *
     * @param {object} itemInfo 单个奖励信息
     * @param {boolean} itemInfo 是否是双倍奖励
     * @param {function} callback 更新签到界面的UI
     */
    receiveReward (itemInfo: any, isDouble: boolean, callback: Function, ) {
        let day:number = itemInfo.ID;
        //大于可领奖天数点击图标不能领取
        if (this.currentDay < day) {
            return;
        }

        let title = i18n.t("showReward.signinReward");
        let targetItemInfo = util.clone(itemInfo);

        if (itemInfo.ID == 2 || itemInfo.ID == 7) {
            let targetCar = localConfig.instance.queryByID('car', itemInfo.amount);
            targetItemInfo.ID = targetCar.ID;
            let isHadCar = playerData.instance.playerInfo.cars.indexOf(targetCar.ID) !== -1;
            if (isHadCar) {
                targetItemInfo.rewardType = constant.REWARD_TYPE.GOLD;
                targetItemInfo.amount = itemInfo.ID == 2 ? constant.GOLD_REWARD.SECOND : constant.GOLD_REWARD.SEVENT;
            }
        }

        targetItemInfo.amount = isDouble ? targetItemInfo.amount *= 2 : targetItemInfo.amount;

        uiManager.instance.shiftFromPopupSeq('signIn/signIn');
        // this.unschedule(this.showBtnSecondaryCallback);

        if (targetItemInfo.rewardType === constant.REWARD_TYPE.GOLD) {
            playerData.instance.updatePlayerInfo('gold', targetItemInfo.amount);
            gameLogic.showFlyReward(constant.REWARD_TYPE.GOLD, ()=>{
                clientEvent.dispatchEvent('updateGold');
            });

            callback && callback();
            return;
        }

        uiManager.instance.pushToPopupSeq('common/showReward', 'showReward', [targetItemInfo, false, title, callback]);
    }

    /**
     * 点击领取
     *
     * @param {boolean} isDouble
     * @memberof signIn
     */
    receiveClick (isDouble: boolean) {
        for (let j = 0; j < this.arrSignInItemScript.length; j++ ) {
            let element = this.arrSignInItemScript[j];
            //只有今天的状态才存在RECEIVABLE
            if (element.itemInfo.status === constant.SIGNIN_REWARD_STATUS.RECEIVABLE) {
                element._parent.receiveReward(element.itemInfo, isDouble, ()=>{
                    element.markReceived();
                });
                break;
            }
        }
    }

    /**
     * 双倍领取
     */
    onBtnDoubleClick () {
        // 用户 TODO：此处可实现看视频领双倍福利功能
        // gameLogic.openReward(constant.SHARE_FUNCTION.SIGNIN, (err)=>{
        //    if (!err) {
             this.receiveClick(true);
        //    }
        // })
    }

    /**
     * 普通领取
     */
    onBtnNormalClick () {
        this.receiveClick(false);
    }

    /**
     * 领取
     */
    onBtnReceiveClick () {
        // 用户 TODO：此处可实现看视频领福利功能
        // gameLogic.openReward(constant.SHARE_FUNCTION.SIGNIN, (err)=>{
        //     if (!err) {
              this.receiveClick(false);
            // }
        //  })
    }

    /**
     * 暂不领取,关闭
     */
    onBtnCloseClick () {
        uiManager.instance.shiftFromPopupSeq('signIn/signIn');
    }

}
