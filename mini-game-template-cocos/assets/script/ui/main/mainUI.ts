// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Label, Animation, AnimationState, Sprite, Node, Vec3, tweenUtil, tween, sys} from "cc";
import { clientEvent } from "../../framework/clientEvent";
import { playerData } from "../../framework/playerData";
import { util } from "../../framework/util";
import { constant } from "../../framework/constant";
import { uiManager } from "../../framework/uiManager";
import { localConfig } from "../../framework/localConfig";
import { gameLogic } from "../../logic/gameLogic";
const { ccclass, property } = _decorator;

@ccclass("mainUI")
export class mainUI extends Component {
    /* class member could be defined like this */
    // dummy = '';
    @property(Sprite)
    spIcon: Sprite = null!;

    @property(Label)
    lbGold: Label = null!;

    @property(Node)
    nodeBtnService: Node = null!;

    //签到红点提示
    @property(Node)
    nodeSignInRedDot: Node = null!;

    @property(Node)
    nodeGoldIcon: Node = null!;

    @property(Node)
    nodeShopRedDot: Node = null!;

    targetScale: Vec3 = new Vec3(1, 1, 1);
    isGoldPlaying: boolean = false;
    arrCars: number[] = [];
    isShowAniFinished = false;
    debugIdx = 0;
    debugTimer = 0;


    start () {
        // Your initialization goes here.

        //界面启动后表示登录完了
        gameLogic.afterLogin();

        this.updateSignIn();
    }

    onEnable () {
        clientEvent.on('updateGold', this.updateGold, this);
        clientEvent.on('updateSignIn', this.updateSignIn, this);
        clientEvent.on('receiveGold', this.receiveGold, this);
        clientEvent.on('updateCar', this.updateCar, this);
        clientEvent.on('buyCar', this.updateCarReceived, this);
        this.nodeGoldIcon.on(Node.EventType.TOUCH_START, this.resetPlayData, this);
    }

    onDisable () {
        clientEvent.off('updateGold', this.updateGold, this);
        clientEvent.off('updateSignIn', this.updateSignIn, this);
        clientEvent.off('receiveGold', this.receiveGold, this);
        clientEvent.off('updateCar', this.updateCar, this);
        clientEvent.off('buyCar', this.updateCarReceived, this);
        this.nodeGoldIcon.off(Node.EventType.TOUCH_START, this.resetPlayData, this);
    }

    updateGold () {
        let gold = playerData.instance.playerInfo.gold || 0;
        this.lbGold.string = util.formatMoney(gold);
    }

    receiveGold() {
        this.isGoldPlaying = true;
        this.nodeGoldIcon.setScale(new Vec3(1, 1, 1));
        tween(this.targetScale)
            .to(0.2, new Vec3(1.2, 1.2, 1.2))
            .to(0.2, new Vec3(1, 1, 1))
            .call(()=>{
                this.isGoldPlaying = false;
            })
            .start();
    }

    /**
     * 更新签到的红点显隐
     */
    updateSignIn () {
        playerData.instance.updateSignInCurrentDay();
        let signInStatus = playerData.instance.getSignInReceivedInfo();
        this.nodeSignInRedDot.active = !signInStatus.isAllReceived;
    }

    onBtnBgClick () {
        //先咨询，要不要试用车辆
        if (playerData.instance.playerInfo.level > constant.NEWBEE_LEVEL) {
            uiManager.instance.showDialog('main/trial', [()=>{
                this.askInvincible();
            }]);
        } else {
            //前2关不试用
            this.showStart();
        }
    }

    askInvincible () {
        if (playerData.instance.playerInfo.level > constant.NEWBEE_LEVEL) {
            uiManager.instance.showDialog('main/invincible', [()=>{
                this.showStart();
            }]);
        } else {
            this.showStart();
        }
    }

    showStart () {
        clientEvent.dispatchEvent('startGame');
    }

    onBtnDailyClick () {
        //7日签到
        uiManager.instance.showDialog('signIn/signIn');
    }

    onBtnLotteryClick () {
        //大转盘
        uiManager.instance.showDialog('lottery/lottery');
    }

    onBtnRankClick () {
        //排行榜
        uiManager.instance.showDialog('rank/rank');
    }

    onBtnChangeCarClick () {
        //换车
        uiManager.instance.showDialog('shop/shop');
    }

    onBtnSettingClick () {
        //设置按钮
        uiManager.instance.showDialog('main/setting');
    }

    updateCar () {

    }

    updateCarReceived () {
        this.nodeShopRedDot.active = playerData.instance.hasCarCanReceived();
    }

    onBtnLeftClick () {
        let car = playerData.instance.showCar;

        let idx = this.arrCars.indexOf(car);
        idx--;
        if (idx < 0) {
            idx = this.arrCars.length - 1;
        }

        playerData.instance.showCar = this.arrCars[idx];

        clientEvent.dispatchEvent('updateCar');
    }

    onBtnRightClick () {
        let car = playerData.instance.showCar;

        let idx = this.arrCars.indexOf(car);
        idx++;
        if (idx >= this.arrCars.length) {
            idx = 0;
        }

        playerData.instance.showCar = this.arrCars[idx];

        clientEvent.dispatchEvent('updateCar');
    }

    show () {
        this.updateGold();
        this.nodeShopRedDot.active = playerData.instance.hasCarCanReceived();
        this.arrCars.length = 0;
        // let arr = localConfig.instance.getCars();
        let arr = playerData.instance.playerInfo.cars;
        arr.forEach((element: string) => {
            // this.arrCars.push(element.ID);
            const index = parseInt(element);
            if(index >= 0){
                this.arrCars.push(index);
            }
        });

        this.isShowAniFinished = true;

        gameLogic.updateRewardIcon(constant.SHARE_FUNCTION.TRIAL, this.spIcon, ()=>{
            if (playerData.instance.hasCar(playerData.instance.showCar)) {
                this.spIcon.node.active = false;
            }
        });

        if (playerData.instance.isComeFromBalance) {
            this.onBtnBgClick();
        }
    }

    update (deltaTime: number) {
        // Your update function goes here.

        if (this.isGoldPlaying || this.targetScale.x !== 1) {
            this.nodeGoldIcon.setScale(this.targetScale);
        }
    }

    onBtnDebugClick() {
        return;
        if (!this.debugIdx) {
            this.debugIdx = 0;
        }

        const MAX_TIMES = 5;

        this.debugIdx++;

        if (this.debugIdx > MAX_TIMES) {
            uiManager.instance.showDialog('debug/password');
        } else if (!this.debugTimer) {
            var _this = this;
            this.debugTimer = setTimeout(function() {
                // _this.debugTimer = null;
                if (_this.debugIdx < MAX_TIMES) {
                    _this.debugIdx = 0;
                }
            }, 2000);
        }
    }

    resetPlayData(){
        sys.localStorage.removeItem('CarConfig');
        uiManager.instance.showTips('数据重置成功！');
    }
}
