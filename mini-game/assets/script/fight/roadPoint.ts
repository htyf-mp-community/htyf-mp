// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Vec3, Enum, macro } from "cc";
import { fightConstants } from "./fightConstants";
import { resourceUtil } from "../framework/resourceUtil";
const { ccclass, property } = _decorator;

export enum ROAD_POINT_TYPE {
    '普通节点' = fightConstants.ROAD_POINT_TYPE.NORMAL,         //普通节点
    '开始节点' = fightConstants.ROAD_POINT_TYPE.START,          //开始节点
    '接客节点' = fightConstants.ROAD_POINT_TYPE.GREETING,       //平台节点（用于接客）
    '送客节点' = fightConstants.ROAD_POINT_TYPE.PLATFORM,       //平台节点（用于送客）
    '结束节点' = fightConstants.ROAD_POINT_TYPE.END,            //结束节点
    'AI开始节点' = fightConstants.ROAD_POINT_TYPE.AI_START                //AI开始节点
}

Enum(ROAD_POINT_TYPE)

export enum ROAD_MOVE_TYPE {
    "直线行走" = fightConstants.ROAD_MOVE_TYPE.LINE,       //直线行走
    "曲线行走" = fightConstants.ROAD_MOVE_TYPE.BEND,       //曲线行走
}

Enum(ROAD_MOVE_TYPE)

@ccclass("roadPoint")
export class roadPoint extends Component {
    @property({displayName: '类型', type: ROAD_POINT_TYPE, displayOrder: 1})
    type: ROAD_POINT_TYPE = ROAD_POINT_TYPE.普通节点;

    @property({displayName: '下一站', type: Node, displayOrder: 2})
    next: Node | null = null;

    @property({displayName: '行走方式', type: ROAD_MOVE_TYPE, displayOrder: 3})
    moveType: ROAD_MOVE_TYPE = ROAD_MOVE_TYPE.直线行走;

    @property({displayName: '顺时针', displayOrder: 4, visible:  function (this: roadPoint){
        return this.moveType === fightConstants.ROAD_MOVE_TYPE.BEND;
    }})
    clockwise: boolean = false;

    @property({displayName: '顾客方向', displayOrder: 4, visible:  function (this: roadPoint){
        return this.type === fightConstants.ROAD_POINT_TYPE.GREETING || this.type === fightConstants.ROAD_POINT_TYPE.PLATFORM;
    }})
    direction: Vec3 = new Vec3();

    @property({displayName: '延迟生成/秒', displayOrder: 5, visible:  function (this: roadPoint){
        return this.type === fightConstants.ROAD_POINT_TYPE.AI_START;
    }})
    delayTime: number = 1; //默认不延迟

    @property({displayName: '生成频率/秒', displayOrder: 5, visible:  function (this: roadPoint){
        return this.type === fightConstants.ROAD_POINT_TYPE.AI_START;
    }})
    genInterval: number = 3;

    @property({displayName: '车辆行驶速度', displayOrder: 5, visible:  function (this: roadPoint){
        return this.type === fightConstants.ROAD_POINT_TYPE.AI_START;
    }})
    carSpeed: number = 0.05;

    @property({displayName: '产生车辆(,分隔)', displayOrder: 5, visible:  function (this: roadPoint){
        return this.type === fightConstants.ROAD_POINT_TYPE.AI_START;
    }})
    cars: string = '201';
    arrCars: Array<string> = [];

    _generateCb: Function | null = null;

    start () {
        // Your initialization goes here.
        this.arrCars = this.cars.split(',');
    }

    startGenerateCar (generateCb: Function) {
        if (this.type !== fightConstants.ROAD_POINT_TYPE.AI_START) {
            return;
        }

        this._generateCb = generateCb;
        this.stopGenerateCar();
        this.scheduleOnce(this.delayStartGen, this.delayTime);

        //触发资源预加载
        resourceUtil.getCarsBatch(this.arrCars, ()=>{

        }, ()=>{

        });
    }

    delayStartGen () {
        this.scheduleGen(); //时间到了先生成，然后再过一段时间再生成
        this.schedule(this.scheduleGen, this.genInterval, macro.REPEAT_FOREVER);
    }

    scheduleGen () {
        //随机生成车辆
        let rand = Math.floor(Math.random() * this.arrCars.length);

        if (this._generateCb) {
            this._generateCb(this, this.arrCars[rand]);
        }
    }

    stopGenerateCar () {
        this.unschedule(this.delayStartGen);
        this.unschedule(this.scheduleGen);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
