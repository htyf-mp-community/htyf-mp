// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Sprite, SpriteFrame, Label, Node, Vec3, Animation} from "cc";
import { playerData } from '../../framework/playerData';
import { constant } from '../../framework/constant';
import { gameLogic } from "../../logic/gameLogic";
import { localConfig } from '../../framework/localConfig';
import { clientEvent } from '../../framework/clientEvent';
import { uiManager } from '../../framework/uiManager';
import { resourceUtil } from '../../framework/resourceUtil';

const { ccclass, property } = _decorator;


@ccclass("signInItem")
export class signInItem extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    //蓝色背景
    @property(SpriteFrame)
    sfBgBlue: SpriteFrame = null!;

    //黄色背景
    @property(SpriteFrame)
    sfYellow: SpriteFrame = null!;

    //奖励节点
    @property(Sprite)
    spReward: Sprite = null!;

    //金币图标
    @property(SpriteFrame)
    sfGold: SpriteFrame = null!;

    //打勾图标
    @property(Node)
    nodeTick: Node = null!;

    //补签按钮
    @property(Node)
    nodeBtnFillSign: Node = null!;

    //补签后可以领取的按钮
    @property(Node)
    nodeBtnAfterFillSign: Node = null!;

    //天数标记
    @property(Label)
    lbDayIndex: Label = null!;

    //高亮节点
    @property(Node)
    nodeLight: Node = null!;

    //奖励数量
    @property(Label)
    lbValue: Label = null!;

    _parent: any = null;
    itemInfo: any = null;
    isHadCar: any = null;

    start () {
        // Your initialization goes here.
    }

    init (itemInfo: any, parent: any) {
        this._parent = parent;
        this.itemInfo = itemInfo;
        this.lbValue.string = itemInfo.rewardType === constant.REWARD_TYPE.CAR ? '' : String(itemInfo.amount);
        this.lbDayIndex.string = String(itemInfo.ID);

        this.setIcon(itemInfo.rewardType);
        this.setStatus(itemInfo.status);

        this.node.getComponent(Sprite)!.spriteFrame = Number(itemInfo.ID) >= 7 ? this.sfBgBlue : this.sfYellow;
    }


    setIcon (type: number) {

        switch (type) {
            case constant.REWARD_TYPE.DIAMOND:
                break;
            case constant.REWARD_TYPE.GOLD:
                this.spReward.spriteFrame = this.sfGold;
                break;
            case constant.REWARD_TYPE.CAR:
                let targetCar = localConfig.instance.queryByID('car', this.itemInfo.amount);
                let carModel = targetCar.model;
                if (playerData.instance.isHadCarAndDuringPeriod(this.itemInfo.amount)) {
                    this.spReward.spriteFrame = this.sfGold;
                    if (this.itemInfo.ID == 2) {
                        this.lbValue.string = String(constant.GOLD_REWARD.SECOND);
                    } else if (this.itemInfo.ID == 7) {
                        this.lbValue.string = String(constant.GOLD_REWARD.SEVENT);
                    }
                } else {
                    resourceUtil.setCarIcon(carModel, this.spReward, false, ()=>{});
                }
                break;
        }
    }

    setStatus (status: number) {
        switch (status) {
            case constant.SIGNIN_REWARD_STATUS.RECEIVED:
                this.showItemUI(false, true, false, false);
                break;
            case constant.SIGNIN_REWARD_STATUS.RECEIVABLE:
                this.showItemUI(true, false, false, false);
                break;
            case constant.SIGNIN_REWARD_STATUS.UNRECEIVABLE:
                this.showItemUI(false, false, false, false);
                break;
            case constant.SIGNIN_REWARD_STATUS.FILL_SIGNIN:
                this.showItemUI(false, false, true, false);
                break;
            case constant.SIGNIN_REWARD_STATUS.AFTER_FILL_SIGNIN:
                this.showItemUI(true, false, false, true);
                break;
        }
    }

    showItemUI (isShowLight: boolean, isShowTick: boolean, isShowBtnFillSignIn: boolean, isShowBtnReceive: boolean) {
        this.nodeLight.active = isShowLight;
        let lightAni = this.nodeLight.getComponent(Animation)!;
        isShowLight ? lightAni.play() : lightAni.stop();
        this.nodeTick.active = isShowTick;
        this.nodeBtnFillSign.active = isShowBtnFillSignIn;
        this.nodeBtnAfterFillSign.active = isShowBtnReceive;
    }

    /**
     * 点击补签后的领取按钮触发，或者点击当前可领取触发
     */
    onBtnAfterFillSignClick () {
        if (this.itemInfo.status === constant.SIGNIN_REWARD_STATUS.AFTER_FILL_SIGNIN || this.itemInfo.status === constant.SIGNIN_REWARD_STATUS.RECEIVABLE) {
            this._parent.receiveReward(this.itemInfo, false, this.markReceived.bind(this));
        }
    }

    /**
     * 标记为已领取
     */
    markReceived () {
        this.itemInfo.status = constant.SIGNIN_REWARD_STATUS.RECEIVED;
        this.setStatus(this.itemInfo.status);

        //记录车领取的时间
        if ((this.itemInfo.ID === 2 || this.itemInfo.ID === 7) && !this.isHadCar) {
            playerData.instance.updateDictGetCarTime(this.itemInfo.amount);
        }

        //添加已领取奖励的天数
        if (this.itemInfo.ID) {
            playerData.instance.updateSignInReceivedDays(this.itemInfo.ID);
            clientEvent.dispatchEvent('updateSignIn');
        }

        this.close();
    }

    close () {
        uiManager.instance.shiftFromPopupSeq('common/showReward');
        let receiveStatus = playerData.instance.getSignInReceivedInfo();
        let isAllReceived = receiveStatus.isAllReceived;
        if (!isAllReceived) {
            uiManager.instance.pushToPopupSeq('signIn/signIn', 'signIn', {});
        } else {
            uiManager.instance.shiftFromPopupSeq("common/showReward");
        }
    }

    /**
     * 标记为补签后可以领取
     */
    markAfterFillSignIn() {
        this.itemInfo.status = constant.SIGNIN_REWARD_STATUS.AFTER_FILL_SIGNIN;
        this.setStatus(this.itemInfo.status);
        playerData.instance.updateSignInFillSignInDays(this.itemInfo.ID, false);
    }

    /**
     * 补签按钮
     */
    onBtnFillSignInClick () {
        gameLogic.openReward(constant.SHARE_FUNCTION.FILL_SIGNIN, (err)=>{
            if (!err) {
                this.markAfterFillSignIn();
            }
        })
    }

}
