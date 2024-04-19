import { _decorator, Component, Node, Vec3, Sprite, Widget } from "cc";
import { uiManager } from "../../framework/uiManager";
import { gameLogic } from "../../logic/gameLogic";
import { constant } from "../../framework/constant";
import { localConfig } from "../../framework/localConfig";
import { playerData } from "../../framework/playerData";
import { poolManager } from "../../framework/poolManager";
import { resourceUtil } from "../../framework/resourceUtil";
import { clientEvent } from "../../framework/clientEvent";

const { ccclass, property } = _decorator;

@ccclass("trial")
export class trial extends Component {
    /* class member could be defined like this */
    // dummy = '';

    @property(Node)
    nodeCarParent: Node = null!;

    @property(Widget)
    wgMenu: Widget = null!;

    currentCar: Node | null = null;
    carDegree: number = 0;
    rotateSpeed: number = 30;
    carId = 0;

    @property(Sprite)
    spIcon: Sprite = null!;
    _callback: Function | undefined = undefined;

    start () {
        // Your initialization goes here.
    }

    show (callback: Function) {
         // 防止因操作卡顿造成重复展示
         if(this._callback){
            return;
        }
        this._callback = callback;

        gameLogic.updateRewardIcon(constant.SHARE_FUNCTION.TRIAL, this.spIcon);

        if (this.currentCar) {
            poolManager.instance.putNode(this.currentCar);
            this.currentCar = null;
        }

        //随机辆未拥有的车
        let arrCars = localConfig.instance.getCars(); //获得所有车
        let arrLottery: number[] = [];
        arrCars.forEach(element => {
            if (!playerData.instance.hasCar(element.ID)) {
                //未拥有的车辆，加入抽奖列表
                arrLottery.push(element.ID);
            }
        });

        if (arrLottery.length <= 0) {
            //已经拥有全部车辆
            this.onBtnCloseClick();
            return;
        }

        let rand = Math.floor(Math.random() * arrLottery.length);

        this.carId = arrLottery[rand];
        let carInfo = localConfig.instance.queryByID('car', this.carId.toString());

        console.log('trial show car: ' + carInfo.model)
        resourceUtil.getUICar(carInfo.model, (err, prefab)=>{
            if (err) {
                console.error(err, carInfo.model);
                return;
            }

            this.carDegree = 0;
            this.currentCar = poolManager.instance.getNode(prefab, this.nodeCarParent);
        });
    }

    onBtnCloseClick () {
        uiManager.instance.hideDialog('main/trial');
        this._callback && this._callback();
        this._callback = undefined;
    }

    onBtnTrialClick () {
        gameLogic.openReward(constant.SHARE_FUNCTION.TRIAL, (err, type)=>{
            if (err) {
                return;
            }

            playerData.instance.showCar = this.carId;
            clientEvent.dispatchEvent('updateCar');
            this.onBtnCloseClick();
        });
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
