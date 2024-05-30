// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Prefab, instantiate, Node, RigidBody, Collider } from "cc";
import { fightMap } from "./fightMap";
import { customerManager } from "./customerManager";
import { carManager } from "./carManager";
import { clientEvent } from "../framework/clientEvent";
import { fightConstants } from "./fightConstants";
import { resourceUtil } from "../framework/resourceUtil";
import { uiManager } from "../framework/uiManager";
import { playerData } from "../framework/playerData";
import { fightCanvas } from "../ui/fight/fightCanvas";
import { effectManager } from "./effectManager";
import { i18n } from "../i18nMaster/runtime-scripts/LanguageData";
const { ccclass, property } = _decorator;

@ccclass("fightManager")
export class fightManager extends Component {
    @property(fightCanvas)
    fightLoading: fightCanvas = null!;

    //场景地图
    @property({type: fightMap})
    mapManager: fightMap = null!;

    @property({type: customerManager})
    customerManager: customerManager = null!;

    @property({type: carManager})
    carManager: carManager = null!;

    @property({type: effectManager})
    effectManager: effectManager = null!;

    @property({type: Node, displayName: '地面'})
    nodeGround: Node = null!;

    isStart = false;
    isOver = false;
    isFinishedLevel = false;

    money = 0;
    curLevel = 0;
    hasRevive = false;

    start () {
        // Your initialization goes here.
        this.initGround();

        this.loadMap(()=>{
            this.initCar();
            this.loadCar();
        });

        // this.initCar();
    }

    onEnable () {
        clientEvent.on('startGame', this.startGame, this);
        clientEvent.on('takeCustomer', this.onTakeCustomer, this);
        clientEvent.on('gameOver', this.gameOver, this);
        clientEvent.on('newLevel', this.newLevel, this);
        clientEvent.on('updateCar', this.updateMainCar, this);
        clientEvent.on('revive', this.revive, this);
    }

    onDisable () {
        clientEvent.off('startGame', this.startGame, this);
        clientEvent.off('takeCustomer', this.onTakeCustomer, this);
        clientEvent.off('gameOver', this.gameOver, this);
        clientEvent.off('newLevel', this.newLevel, this);
        clientEvent.off('updateCar', this.updateMainCar, this);
        clientEvent.off('revive', this.revive, this);
    }

    initGround () {
        let collider = this.nodeGround.getComponent(Collider) as Collider;

        collider.setGroup(fightConstants.CAR_GROUP.NORMAL);
        collider.setMask(-1);
    }

    loadMap (cb?:Function) {
        //地图载入
        let level = 1;
        if (playerData.instance.playerInfo) {
            console.log("###playerData.instance.playerInfo.realLevel;", playerData.instance.playerInfo.realLevel);

            if (playerData.instance.playerInfo.passCheckPoint) {
                level = playerData.instance.playerInfo.realLevel || level;
            } else {
                level = playerData.instance.playerInfo.level || level;
            }

            console.log("###level", level);
        }

        this.curLevel = level;

        // let level = 3;
        // level = 3;
        console.log(`load level ${this.curLevel}`)
        let mapId = this.curLevel > 100 ? this.curLevel : this.curLevel + 100;
        clientEvent.dispatchEvent('updateLoading', 4, i18n.t('fightManager.loadingMap'));
        resourceUtil.getMap(mapId, (err, res)=>{
            if (err) {
                console.error(err);
                return;
            }

            clientEvent.dispatchEvent('updateLoading', 10, i18n.t('fightManager.buildingCity'));
            this.mapManager.buildMap(res, ()=>{

            }, ()=>{
                clientEvent.dispatchEvent('updateLoading', 6, i18n.t('fightManager.cityLoadOver'));
                cb && cb();
            });
        });
    }

    initCar () {
        this.carManager.init(this.mapManager, this.customerManager);
    }

    reset () {
        this.carManager.reset();
        this.customerManager.reset();
        this.effectManager.reset();

        this.isStart = false;
        this.isOver = false;
        this.isFinishedLevel = false;
        this.money = 0;
        this.hasRevive = false;

        this.loadCar();
    }

    loadCar () {
        //预加载使用的汽车,加载完毕后，关闭界面
        this.carManager.preloadAICar(()=>{
            this.fightLoading.finishLoading();

            //等进度条加载完后展示主界面
            this.showMainUI();
        });
    }

    startGame () {
        if (this.isStart) {
            return;
        }

        this.isStart = true;
        this.carManager.startGame();

        this.showFightUI();
    }

    gameOver (isFinished: boolean) {
        if (this.isOver) {
            return;
        }

        this.isFinishedLevel = isFinished;
        this.isOver = true;
        this.carManager.gameOver();
        this.showBalanceUI();
    }

    onTakeCustomer () {
        //完成乘客接送，这时候要计算加到多少钱
        //公式 （30+关卡数/2）+ 10  取整
        let rand = Math.floor(30 + this.curLevel / 2 + Math.floor(Math.random() * 10));

        this.money += rand;

        clientEvent.dispatchEvent('makeMoney', rand);

        //显示获得金币的特效
        resourceUtil.getEffect('coin', (err, prefab)=>{
            if (err) {
                console.error(err);
            }

            let node = instantiate(prefab!);
            node.parent = this.node;
            if (this.carManager.mainCar) {
                node.setWorldPosition(this.carManager.mainCar.node.getWorldPosition());
            }

            this.scheduleOnce(()=>{
                node.destroy();
            }, 2);
        });
    }

    showMainUI () {
        //一开始加载主界面
        uiManager.instance.showDialog('main/mainUI');
    }

    showFightUI () {
        uiManager.instance.hideDialog('main/mainUI');
        uiManager.instance.showDialog('fight/fightUI', [this]); //将自身当作参数传入
    }

    showBalanceUI () {
        //level: number, curProgress: number, isTakeOver: boolean,  maxProgress: number, money: number, isFinishLevel:boolean
        let objProgress = this.carManager.getCurrentProgress();
        uiManager.instance.showDialog('fight/balance', [
            playerData.instance.playerInfo.level,
            objProgress.cur,
            objProgress.isOver,
            this.mapManager.levelProgressCnt,
            this.money,
            this.isFinishedLevel
        ]);
    }

    /**
     * 重置关卡
     *
     * @param {boolean} isNewLevel 是否为新关卡
     * @memberof fightManager
     */
    newLevel (isNewLevel: boolean) {
        //重置关卡
        this.fightLoading.loadNewLevel();
        uiManager.instance.hideDialog('fight/fightUI');
        this.hasRevive = false;
        if (isNewLevel) {
            //要将原有地图移除，并引入新地图
            this.mapManager.recycle();
            this.loadMap(()=>{
                //地图处理完毕，后续处理
                this.reset();
            });
        } else {
            this.reset();
        }
    }

    updateMainCar () {
        this.carManager.creatMainCar();
    }

    revive () {
        this.carManager.revive();
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
