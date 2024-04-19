import { Vec3 } from 'cc';
// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Prefab, Node, instantiate, macro } from "cc";
import { fightMap } from "./fightMap";
import { car } from "./car";
import { customerManager } from "./customerManager";
import { follow } from "./follow";
import { roadPoint } from "./roadPoint";
import { clientEvent } from "../framework/clientEvent";
import { resourceUtil } from "../framework/resourceUtil";
import { poolManager } from "../framework/poolManager";
import { playerData } from "../framework/playerData";
import { constant } from "../framework/constant";
import { localConfig } from "../framework/localConfig";
import { fightConstants } from "./fightConstants";
const { ccclass, property } = _decorator;

@ccclass("carManager")
export class carManager extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    _fightMap!: fightMap;
    _customerManager!: customerManager;

    mainCar!: car;

    @property({type: follow})
    followCamera: follow = null!;

    gameStart = false;

    start () {
        // Your initialization goes here.
    }

    onEnable() {
        clientEvent.on('showInvincible', this.showInvincible, this);
    }

    onDisable() {
        clientEvent.off('showInvincible', this.showInvincible, this);
    }

    showInvincible () {
        if (this.mainCar) {
            this.mainCar.isInvincible = true;
        }
    }

    init (fightMap: fightMap, customerManager: customerManager) {
        this._fightMap = fightMap;
        this._customerManager = customerManager;

        this.creatMainCar();
    }

    creatMainCar () {
        let car = playerData.instance.showCar ? playerData.instance.showCar: constant.INITIAL_CAR;
        let carInfo = localConfig.instance.queryByID('car', car.toString());
        let skin = carInfo ? carInfo.model: constant.MIN_CAR_ID;

        resourceUtil.getCar(skin, (err, pfCar)=>{
            if (err) {
                console.error(err);
                return;
            }

            if (this.mainCar) {
                poolManager.instance.putNode(this.mainCar.node);
            }

            let nodeCar = poolManager.instance.getNode(pfCar, this.node);
            this.mainCar = nodeCar.getComponent('car') as car;
            this.mainCar.markMainCar(true);
            this.mainCar.setEntry(this._fightMap.path[0]);
            this.mainCar.manager = this._customerManager;
            this.mainCar.maxProgress = this._fightMap.levelProgressCnt;
            this.mainCar.setMoveOverListener(()=>{

            });

            this.followCamera.followTarget = nodeCar;
            this.followCamera.showStart();
        })

        // this.nodeTailLine = instantiate(this.pfTailLine);
        // this.nodeTailLine.parent = this.node;
        // this.nodeTailLine.active = false;
    }

    //预加载所有ai车辆
    preloadAICar (callback: Function) {
        let arrPreload = [];
        for (let idx = 1; idx < this._fightMap.path.length; idx++) {
            let nodeRoadPoint = this._fightMap.path[idx];
            let point = nodeRoadPoint.getComponent(roadPoint)!;

            if (point.type !== fightConstants.ROAD_POINT_TYPE.AI_START) {
                return;
            }

            let arrCars = point.cars.split(',');
            for (let idx = 0; idx < arrCars.length; idx++) {
                if (arrPreload.indexOf(arrCars[idx]) === -1) {
                    arrPreload.push(arrCars[idx]);
                }
            }
        }

        let cur = 0;
        resourceUtil.getCarsBatch(arrPreload, (arg)=>{
            //批量加载，每一辆，先加载2%
            cur++;
            if (cur <= 15) {
                clientEvent.dispatchEvent('updateLoading', 2);
            }
        }, ()=>{
            if (cur <= 15) {
                clientEvent.dispatchEvent('updateLoading', 30 - cur * 2);
            }
            callback && callback();
        });
    }

    startGenerateEnemy () {
        this.genAICar = this.genAICar.bind(this);
        for (let idx = 1; idx < this._fightMap.path.length; idx++) {
            let nodeRoadPoint = this._fightMap.path[idx];
            let point = nodeRoadPoint.getComponent(roadPoint)!;
            point.startGenerateCar(this.genAICar);
        }
    }

    stopGenerateEnemy () {
        for (let idx = 1; idx < this._fightMap.path.length; idx++) {
            let nodeRoadPoint = this._fightMap.path[idx];
            let point = nodeRoadPoint.getComponent(roadPoint)!;
            point.stopGenerateCar();
        }
    }

    genAICar (road: roadPoint, randCar: string) {
        //应该动态生成
        resourceUtil.getCar(randCar, (err, pfCar)=>{
            if (err) {
                console.error(err);
                return;
            }

            let otherCar = poolManager.instance.getNode(pfCar, this.node);

            let car = otherCar.getComponent('car') as car;
            car.setEntry(road.node);
            car.minSpeed = road.carSpeed;
            car.maxSpeed = road.carSpeed;
            car.startRunning();
            car.markMainCar(false);
            car.setMoveOverListener((car: car)=>{
                poolManager.instance.putNode(car.node);
            });
        });
    }

    reset () {
        this.mainCar.setEntry(this._fightMap.path[0]);
        this.mainCar.maxProgress = this._fightMap.levelProgressCnt;

        this.followCamera.followTarget = this.mainCar.node;

        this.stopGenerateEnemy();

        this.recycleAllAICar();
    }

    /**
     *回收所有地方车辆
     *
     * @memberof carManager
     */
    recycleAllAICar () {
        let arrCars: Node[] = [];
        let children = this.node.children;
        children.forEach((nodeCar)=>{
            arrCars.push(nodeCar);
        }, this);

        arrCars.forEach((nodeCar)=>{
            let car = nodeCar.getComponent('car') as car;
            if (car && !car.isMain) {
                //车辆回收
                poolManager.instance.putNode(nodeCar);
            }
        });
    }

    /**
     *回收指定范围大小车辆
     *
     * @memberof carManager
     */
    recycleLimitAICar () {
        let arrCars: Node[] = [];
        let children = this.node.children;
        children.forEach((nodeCar)=>{
            arrCars.push(nodeCar);
        }, this);

        arrCars.forEach((nodeCar)=>{
            let car = nodeCar.getComponent('car') as car;
            let distance = Vec3.distance(nodeCar.worldPosition, this.mainCar.node.worldPosition);
            if (car && !car.isMain && Math.abs(distance) <= 5) {
                //车辆回收
                poolManager.instance.putNode(nodeCar);
            } else {
                car.isOver = false;
                car.startRunning();
            }
        });
    }

    /**
     * 由UI层调用，控制车辆行驶
     * @param isRunning
     */
    controlMainCar (isRunning: boolean) {
        if(!this.gameStart){
            return;
        }

        if (isRunning) {
            clientEvent.dispatchEvent('showGuide', false);
            this.mainCar.startRunning();
        } else {
            this.mainCar.stopRunning();
        }
    }

    startGame () {
        this.gameStart = true;
        clientEvent.dispatchEvent('showGuide', true);
        this.mainCar.startWithMinSpeed();
        this.startGenerateEnemy();

        //开启定时检测车辆跟AI车辆是否相近
        this.schedule(this.checkCarIsCloser, 0.2, macro.REPEAT_FOREVER); //每0.2s检测一次
    }

    gameOver () {
        this.gameStart = false;
        this.followCamera.followTarget = null; //将镜头跟随移除，免得一直晃
        this.stopGenerateEnemy();

        //取消车辆的定时检测
        this.unschedule(this.checkCarIsCloser);

        //将其余车给停下来
        this.node.children.forEach((nodeCar)=>{
            let carScript = nodeCar.getComponent(car)!;
            carScript.stopImmediately();
        });
    }

    changeCameraFollowRotation () {
        //镜头方式修改
        this.followCamera.isFollowRotation = !this.followCamera.isFollowRotation;
    }

    /**
     * 获取当前关卡进度
     *
     * @memberof carManager
     */
    getCurrentProgress () {

        return {cur: this.mainCar.curProgress, isOver: !this.mainCar.hasCustomer};
    }

    revive () {
        this.recycleLimitAICar();
        this.mainCar.revive();
        this.followCamera.followTarget = this.mainCar.node;
        this.startGenerateEnemy();
    }

    checkCarIsCloser () {
        if (!this.mainCar.isCarMoving) {
            return;//车辆没有在移动，不需要检测
        }

        let nodeMainCar = this.mainCar.node;
        let posMainCar = nodeMainCar.getWorldPosition();
        this.node.children.forEach((nodeCar)=>{
            if (nodeCar !== nodeMainCar) {
                let posCar = nodeCar.getWorldPosition();
                let forward = nodeCar.forward;
                posCar.x -= forward.x;
                posCar.z -= forward.z;

                if (Math.abs(posCar.x - posMainCar.x) < 2 && Math.abs(posCar.z - posMainCar.z) < 2) {
                    nodeCar.getComponent(car)!.tooting();
                }
            }
        });
    }
}
