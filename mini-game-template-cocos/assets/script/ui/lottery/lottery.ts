import { instantiate, tween } from 'cc';
// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Label, Prefab, Node, Color, Button, SpriteFrame, Sprite, tweenUtil, Vec3 } from "cc";
import { uiManager } from "../../framework/uiManager";
import { localConfig } from "../../framework/localConfig";
import { playerData } from "../../framework/playerData";
import { lodash } from "../../framework/lodash";
import { lotteryItem } from "./lotteryItem";
import { constant } from "../../framework/constant";
import { clientEvent } from "../../framework/clientEvent";
import { gameLogic } from "../../logic/gameLogic";
import { configuration } from '../../framework/configuration';
const { ccclass, property } = _decorator;

const LOTTERY_PART = 6;
@ccclass("lottery")
export class lottery extends Component {
    /* class member could be defined like this */
    // dummy = '';

    @property(Node)
    arrRewardNode: Node[] = [];

    @property(Prefab)
    pfRewardItem: Prefab = null!;

    @property(Node)
    nodeTurnable: Node = null!;  //转盘用来旋转的

    @property(Node)
    ndBtnClose: Node = null!; //关闭按钮

    @property(Button)
    btnLottery: Button = null!;

    @property(Button)
    btnAd: Button = null!;

    @property(Label)
    lbMoney: Label = null!;

    @property(SpriteFrame)
    imgLotteryBtnDisable: SpriteFrame = null!;

    @property(SpriteFrame)
    imgLotteryBtnEnable: SpriteFrame = null!;

    @property(SpriteFrame)
    imgAdBtnEnable: SpriteFrame = null!;

    @property(Sprite)
    spLotteryBtn: Sprite = null!;

    @property(Sprite)
    spAdIcon: Sprite = null!;

    @property(Sprite)
    spAdBtn: Sprite = null!;

    arrRewardData: any[] = [];

    arrLotteryItem: Node[] = [];
    arrProbability: any[] = [];
    randValue: number = 0;

    curRotation: Vec3 | null = null;

    _receiveCarTimes: number = 0;//获取车的次数

    set receiveCarTimes(num: number) {
        console.log("#####receiveCarTimes", num);
        this._receiveCarTimes = num;
    }

    get receiveCarTimes() {
        return this._receiveCarTimes;
    }

    start () {
        // Your initialization goes here.

    }

    onEnable() {
        clientEvent.on('buyCar', this.onBuyCar, this);
    }

    onDisable() {
        clientEvent.off('buyCar', this.onBuyCar, this);
    }

    onBuyCar () {
        this.initReward();//更新下奖励界面
    }

    show () {
        this.initReward();
        this.initInfo();

        this.btnAd.node.active = true;
    }

    initReward () {
        let arrCars = localConfig.instance.getCars(); //获得所有车
        let arrLottery = [];
        arrCars.forEach(element => {
            if (!playerData.instance.hasCar(element.ID) && element.type === constant.BUY_CAR_TYPE.GOLD) {
                //未拥有的车辆，加入抽奖列表
                arrLottery.push(element.ID);
            }
        });

        if (arrLottery.length < 6) {
            //不足6辆，从已有的车辆中获得
            let arrHas = lodash.cloneDeep(playerData.instance.playerInfo.cars) as any[];

            while(arrLottery.length < 6) {
                //凑足6辆
                let rand = Math.floor(Math.random() * arrHas.length);
                let carId = arrHas[rand];
                let car = localConfig.instance.queryByID('car', carId);
                if (car.type === constant.BUY_CAR_TYPE.GOLD) {
                    arrLottery.push(arrHas.splice(rand, 1)[0]);
                }
            }
        }

        this.arrRewardData = arrLottery;

        this.arrProbability = [];
        let start = 0;
        for (let idx = 0; idx < this.arrRewardNode.length; idx++) {
            let parentNode = this.arrRewardNode[idx];
            let rewardItem = this.arrLotteryItem[idx];
            if (!rewardItem) {
                rewardItem = instantiate(this.pfRewardItem);
                rewardItem.parent = parentNode;
                this.arrLotteryItem[idx] = rewardItem;
            }

            if (this.arrRewardData.length > idx) {
                let car = this.arrRewardData[idx];

                let script = rewardItem.getComponent(lotteryItem)!;
                script.show(car);

                let min = start;
                let max = start + 100 / LOTTERY_PART;  //平均概率
                this.arrProbability.push({min: min, max: max, idx: idx});

                start = max;
            }
        }
    }

    initInfo () {
        this.lbMoney.string = '' + constant.LOTTERY.MONEY;

        this.checkButton();
    }

    checkButton () {
        const isFree = this.checkIsFree();
        this.btnAd.node.active = isFree;
        this.btnLottery.node.active = !isFree;
        if (isFree) {
            return;
        }

        if (playerData.instance.playerInfo.gold > constant.LOTTERY.MONEY) {
            this.lbMoney.color = new Color(163, 64, 27);
            this.lotteryBtnEnable = true;
            this.adBtnEnable = false;
        } else {
            this.lbMoney.color = Color.RED;
            this.lotteryBtnEnable = false;
            this.adBtnEnable = true;
        }

        gameLogic.updateRewardIcon(constant.SHARE_FUNCTION.LOTTERY, this.spAdIcon, ()=>{

        });
    }

    checkIsFree() {
        let signInInfo = playerData.instance.playerInfo.signInInfo;
        const currentDay = signInInfo.currentDay;
        const data =  configuration.instance.getGlobalData('rewardDays');
        const isFree = data === undefined || parseInt(data) < currentDay ? true : false;
        return isFree;
    }

    set lotteryBtnEnable (value: boolean) {
        if (value) {
            this.btnLottery.interactable =  true;
            this.spLotteryBtn.spriteFrame = this.imgLotteryBtnEnable;
        } else {
            this.btnLottery.interactable =  false;
            this.spLotteryBtn.spriteFrame = this.imgLotteryBtnDisable;
        }
    }

    set adBtnEnable (value: boolean) {
        if (value) {
            this.btnAd.interactable =  true;
            this.spAdBtn.spriteFrame = this.imgAdBtnEnable;
        } else {
            this.btnAd.interactable =  false;
            this.spAdBtn.spriteFrame = this.imgLotteryBtnDisable;
        }
    }

    getRandValue () {
        let idxRand = -1;
        while(idxRand === -1){
            let rand = Math.floor(Math.random() * 100);
            for (let idx = 0; idx < this.arrProbability.length; idx++) {
                let probability = this.arrProbability[idx];

                if (rand >= probability.min && rand < probability.max) {
                    idxRand = probability.idx;
                    break;
                }
            }
        }

        return idxRand;
    }

    onBtnStartClick () {
        //扣除对应金币
        gameLogic.addGold(-constant.LOTTERY.MONEY);     //每抽一次扣一次

        this.startRun();
    }

    onBtnAdClick () {
        const data =  configuration.instance.getGlobalData('rewardDays');
        configuration.instance.setGlobalData('rewardDays', `${!data ? 0 : parseInt(data) + 1}`);
        gameLogic.openReward(constant.SHARE_FUNCTION.LOTTERY, (err)=>{
            if (!err) {
                this.startRun();
            }
        });
    }

    startRun () {
        this.lotteryBtnEnable = false;
        this.adBtnEnable = false;
        this.ndBtnClose.getComponent(Button)!.interactable = false;

        //随机抽奖结果
        this.randValue = this.getRandValue();

        //开始旋转
        //先开始第一轮，根据当前度数，将其旋转至360度
        let targetRotation = -360;
        let curRotation = this.nodeTurnable.eulerAngles.z % 360;
        this.nodeTurnable.eulerAngles = new Vec3(0, 0, curRotation);
        let offset = 360 - curRotation;

        let randTimes = 3 + Math.floor(Math.random() * 4);
        let rotate = targetRotation - randTimes * 360 + this.randValue * 60 + 30 - 360;

        this.curRotation = this.nodeTurnable.eulerAngles.clone();
        tween(this.curRotation)
        // .to(offset/360 + randTimes * 0.5, new Vec3(0, 0, rotate), { easing: 'Circular-Out'})
        .to(offset/360 + randTimes * 0.5, new Vec3(0, 0, rotate), { easing: 'cubicOut'})
        .call(()=>{
            this.curRotation = null;
            this.showReward();
        })
        .start();

        // this.nodeTurnable.eulerAngles = new Vec3(0, 0, rotate);
    }

    showReward () {
        this.ndBtnClose.getComponent(Button)!.interactable = true;
        let itemNode = this.arrLotteryItem[this.randValue];
        let lottery = itemNode.getComponent(lotteryItem)!;

        lottery.showReward(this);

        this.checkButton();
    }

    onBtnCloseClick () {
        // cc.gameSpace.audioManager.playSound('click', false);

        uiManager.instance.hideDialog('lottery/lottery');
    }

    update (deltaTime: number) {
        // Your update function goes here.
        if (this.curRotation) {
            this.nodeTurnable.eulerAngles = this.curRotation;
        }
    }
}
