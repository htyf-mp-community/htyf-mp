// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Animation, director } from "cc";

import { carManager } from "../../fight/carManager";
import { playerData } from "../../framework/playerData";
import { clientEvent } from "../../framework/clientEvent";
import { fightManager } from "../../fight/fightManager";
import { localConfig } from "../../framework/localConfig";
import { resourceUtil } from "../../framework/resourceUtil";
import { i18n } from "../../i18nMaster/runtime-scripts/LanguageData";
const { ccclass, property } = _decorator;

@ccclass("fightUI")
export class fightUI extends Component {
    // Property.
    // yourProperty = "some what";

    @property(Sprite)
    spStart: Sprite = null!;

    @property(Sprite)
    spEnd: Sprite = null!;

    @property({type: Label})
    curLevel: Label = null!;

    @property({type: Label})
    targetLevel: Label = null!;

    @property({type: Node, displayName: "进度项"})
    public progress:Node[] = [];

    @property(Node)
    nodeTalk: Node = null!;

    @property(Label)
    lbTalk: Label = null!;

    @property(Label)
    lbMake: Label = null!;

    @property(Sprite)
    spHead: Sprite = null!;

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

    @property(Animation)
    aniMakeMoney: Animation = null!;

    @property(Node)
    nodeGuide: Node = null!;


    fightManager: fightManager = null!;

    carManager: carManager = null!;

    @property(Sprite)
    spShowGuideTip: Sprite = null!;
    @property(SpriteFrame)
    img01: SpriteFrame = null!;
    @property(SpriteFrame)
    img02: SpriteFrame = null!;
    @property(SpriteFrame)
    img01En: SpriteFrame = null!;
    @property(SpriteFrame)
    img02En: SpriteFrame = null!;

    isShowGuide: boolean = false;//是否展示showGuide动画
    showGuideTime: number = 0;

    gameStart = false;

    constructor() {
        super();
    }

    public start() {

    }

    onEnable () {
        clientEvent.on('greetingCustomer', this.updateCarProgress, this);
        clientEvent.on('takeCustomer', this.updateCarProgress, this);
        clientEvent.on('startGame', this.startGame, this);
        clientEvent.on('gameOver', this.gameOver, this);
        clientEvent.on('showTalk', this.showCustomerTalk, this);
        clientEvent.on('makeMoney', this.onMakeMoney, this);
        clientEvent.on('showGuide', this.showGuide, this);
    }

    onDisable () {
        clientEvent.off('greetingCustomer', this.updateCarProgress, this);
        clientEvent.off('takeCustomer', this.updateCarProgress, this);
        clientEvent.off('startGame', this.startGame, this);
        clientEvent.off('gameOver', this.gameOver, this);
        clientEvent.off('showTalk', this.showCustomerTalk, this);
        clientEvent.off('makeMoney', this.onMakeMoney, this);
        clientEvent.off('showGuide', this.showGuide, this);
    }

    onTouchStart () {
        this.nodeGuide.getComponent(Animation)!.stop();
        this.nodeGuide.active = false;
    }

    public show (manager: fightManager) {
        this.fightManager = manager;
        this.carManager = this.fightManager.carManager;

        this.refreshUI();

        if (!this.carManager.mainCar.isMoving) {
            this.showGuide(true);
        }
    }

    public startGame(){
        this.gameStart = true;
    }

    public gameOver(){
        this.gameStart = false;
        const scheduler = director.getScheduler();
        if(scheduler.isScheduled(this.hideTalk, this)){
            this.unschedule(this.hideTalk);
            this.hideTalk();
        }

        this.updateCarProgress();
    }

    public showGuide (isShow: boolean) {
        this.nodeGuide.active = isShow;
        let ani = this.nodeGuide.getComponent(Animation)!;
        isShow? ani.play(): ani.stop();

        if (isShow) {
            this.isShowGuide = true;
            this.showGuideTime = 0;

            ani.getState('showGuide').setTime(0);
        } else {
            this.isShowGuide = false;
            this.showGuideTime = 0;
        }
    }

    public onBtnAgainClick () {
        // this.fightManager.reset();
        clientEvent.dispatchEvent('newLevel', false);
    }

    public onBtnChangeCameraRotation () {
        this.carManager.changeCameraFollowRotation();
    }

    public refreshUI () {
        let maxProgress = this.fightManager.mapManager.levelProgressCnt; //总共有多少个乘客

        //设置总共有多少个节点
        for (let idx = 0; idx < maxProgress; idx++) {
            this.progress[idx].active = true;
            this.progress[idx].getComponent(Sprite)!.spriteFrame = this.imgProgressNoActive;
        }

        for (let idx = maxProgress; idx < this.progress.length; idx++) {
            this.progress[idx].active = false;
        }

        let level = playerData.instance.playerInfo ? playerData.instance.playerInfo.level : 1;
        this.curLevel.string = `${level}`;
        this.targetLevel.string = `${level + 1}`;

        this.spStart.spriteFrame = this.imgLevelFinished;
        this.spEnd.spriteFrame = this.imgLevelUnfinished;
    }

    public updateCarProgress () {
        //刷新进度
        let objProgress = this.carManager.getCurrentProgress();
        let start = objProgress.cur;
        let end = objProgress.isOver ? start : start - 1;

        for (let idx = 0; idx < end; idx++) {
            this.progress[idx].getComponent(Sprite)!.spriteFrame = this.imgProgressFinished;
        }

        if (!objProgress.isOver) {
            this.progress[end].getComponent(Sprite)!.spriteFrame = this.imgProgressActive;
        }

        if (this.fightManager.isFinishedLevel) {
            this.spEnd.spriteFrame = this.imgLevelFinished;
        }
    }

    /**
     * 顾客上车后或者接到新订单时会有提示
     *
     * @param {string} customerId
     * @param {number} type
     * @memberof fightUI
     */
    showCustomerTalk (customerId: string, type: number) {
        if(!this.gameStart){
            return;
        }
        let arrTalk = localConfig.instance.getTableArr('talk');
        // Note:
        let arrFilter: any[] = [];
        arrTalk.forEach((element: any) => {
            if (element.type === type) {
                arrFilter.push(element);
            }
        });

        let rand = Math.floor(Math.random() * arrFilter.length);
        let objRand = arrFilter[rand];

        this.lbTalk.string = i18n.t(`talk.${objRand.content}`);

        resourceUtil.setCustomerIcon(customerId, this.spHead, ()=>{

        });

        //显示3秒
        this.nodeTalk.active = true;
        this.nodeTalk.getComponent(Animation)!.play();
        this.scheduleOnce(this.hideTalk, 4);
    }

    hideTalk(){
        this.nodeTalk.active = false;
    }

    onMakeMoney (value: number) {
        this.aniMakeMoney.node.active = true;
        this.lbMake.string = `+${value}`;

        this.aniMakeMoney.play();
        this.aniMakeMoney.once(Animation.EventType.FINISHED, ()=>{
            this.aniMakeMoney.node.active = false;
        }, this);
    }

    public update(deltaTime: number) {
        // Your update function goes here.

        if (this.isShowGuide) {
            if (Math.floor(this.showGuideTime) === 0) {
                if (window.i18nConfig.curLang === 'zh') {
                    this.spShowGuideTip.spriteFrame = this.img01;
                } else if (window.i18nConfig.curLang === 'en') {
                    this.spShowGuideTip.spriteFrame = this.img01En;
                }
            }

            this.showGuideTime += deltaTime;

            if (Math.floor(this.showGuideTime) === 1) {
                if (window.i18nConfig.curLang === 'zh') {
                    this.spShowGuideTip.spriteFrame = this.img02;
                } else if (window.i18nConfig.curLang === 'en') {
                    this.spShowGuideTip.spriteFrame = this.img02En;
                }
            } else if (Math.floor(this.showGuideTime) === 2) {
                if (window.i18nConfig.curLang === 'zh') {
                    this.spShowGuideTip.spriteFrame = this.img01;
                } else if (window.i18nConfig.curLang === 'en') {
                    this.spShowGuideTip.spriteFrame = this.img01En;
                }
                this.showGuideTime = 0;
            }
        }
    }
}
