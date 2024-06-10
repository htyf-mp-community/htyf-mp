// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Sprite } from "cc";
import { resourceUtil } from "../../framework/resourceUtil";
import { poolManager } from "../../framework/poolManager";
import { clientEvent } from "../../framework/clientEvent";
import { playerData } from "../../framework/playerData";
import { ICarInfo } from "../../framework/constant";
const { ccclass, property } = _decorator;
@ccclass("shopItem")
export class shopItem extends Component {
    @property (Node)
    nodeSelect: Node = null!;

    @property (Node)
    nodeUsed: Node = null!;

    @property (Node)
    nodeRedDot: Node = null!;

    @property (Sprite)
    spCarIcon: Sprite = null!;

    currentCar: Node | null = null!;
    carInfo: ICarInfo = { ID: 0, type: 0, num: 0, model: '' };

    start () {
        // Your initialization goes here.
    }

    onEnable() {
        clientEvent.on('buyCar', this.refreshCarIcon, this);
        clientEvent.on('updateBuyTask', this.updateBuyTask, this);
    }

    onDisable() {
        clientEvent.off('buyCar', this.refreshCarIcon, this);
        clientEvent.off('updateBuyTask', this.updateBuyTask, this);
    }

    refreshCarIcon() {
        if (!this.carInfo) {
            return;
        }

        resourceUtil.setCarIcon(this.carInfo.model, this.spCarIcon, !playerData.instance.hasCar(this.carInfo.ID), ()=>{

        });

        this.updateBuyTask();
    }

    updateBuyTask () {
        if (!playerData.instance.hasCar(this.carInfo.ID)) {
            let curProgress = playerData.instance.getBuyTypeProgress(this.carInfo.type);
            this.nodeRedDot.active = curProgress >= this.carInfo.num;
        } else {
            this.nodeRedDot.active = false;
        }
    }

    show (carInfo: ICarInfo) {
        this.carInfo = carInfo;
        this.select = false;
        this.nodeUsed.active = false;
        if (this.currentCar) {
            poolManager.instance.putNode(this.currentCar);
            this.currentCar = null;
        }

        if (!carInfo) {
            //空目录
            this.spCarIcon.node.active = false;
            return;
        }

        this.spCarIcon.node.active = true;


        this.refreshCarIcon();

        if (this.carInfo.ID === playerData.instance.getCurrentCar()) {
            this.scheduleOnce(()=>{
                //选中一下
                this.onItemClick(false);
            }, 0);
        }

    }

    set select (value: boolean) {
        this.nodeSelect.active = value;
    }

    get select () {
        return this.nodeSelect.active;
    }

    set used (value: boolean) {
        this.nodeUsed.active = value;
    }

    get used () {
        return this.nodeUsed.active;
    }

    onItemClick (isShowIntertitial = true) {
        if (!this.carInfo) {
            return;
        }


        let hasCar = playerData.instance.hasCar(this.carInfo.ID);

        clientEvent.dispatchEvent('onShopItemSelect', this.carInfo.ID, hasCar);

        this.select = true;

        if (hasCar) {
            this.used = true;

            // 改成点击换车按钮才换车
            // playerData.instance.useCar(this.carInfo.ID);
            // clientEvent.dispatchEvent('updateCar');
        }
    }

    updateUseState () {
        this.used = this.carInfo.ID === playerData.instance.getCurrentCar();
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
