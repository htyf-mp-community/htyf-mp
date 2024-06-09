// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Vec3, CCBoolean, Prefab } from "cc";
import { roadPoint, ROAD_MOVE_TYPE, ROAD_POINT_TYPE } from "./roadPoint";
import { fightConstants } from "./fightConstants";
import { resourceUtil } from "../framework/resourceUtil";
import { poolManager } from "../framework/poolManager";
import { clientEvent } from "../framework/clientEvent";
import { i18n } from "../i18nMaster/runtime-scripts/LanguageData";
const { ccclass, property } = _decorator;
// import {writeFile} from 'fs';

declare global {
    namespace globalThis {
        var cce: any;
    }
}

type ObjRoadPoint = {
    name: string,
    pX:number,
    pY: number,
    pZ: number,
    rX: number,
    rY: number,
    rZ: number,
    sX: number,
    sY: number,
    sZ: number,
    type: ROAD_POINT_TYPE,
    next: ObjRoadPoint | null,
    moveType: ROAD_MOVE_TYPE
    clockwise: boolean,
    direction: Vec3,
    delayTime: number,
    genInterval: number,
    carSpeed: number
    cars: string
};

type PathData = {
    name: string,
    pX: number,
    pY: number,
    pZ: number,
    path: ObjRoadPoint | null,
};

type MapPathData = {
    name: string,
    pX: number,
    pY: number,
    pZ: number,
    children: PathData[]
};

type MapModelData = {
    name: string
    pX: number,
    pY: number,
    pZ: number,
    children: ModelData[];
}

type ModelData = {
    name: string,
    pX: number,
    pY: number,
    pZ: number,
    rX: number,
    rY: number,
    rZ: number,
    sX: number,
    sY: number,
    sZ: number,
    path: ObjRoadPoint,
}

type RoadType = 'plane' | 'road' | 'tree' | 'house' | 'sign' | 'path';

type IObjMap = Record<RoadType, MapModelData | PathData>;

@ccclass("fightMap")
export class fightMap extends Component {
    @property({type: Node, displayName: "各路线起点"})
    public path: Node[] = [];

    objMap!: IObjMap;
    _progressListener: Function | undefined = undefined
    _completeListener: Function | undefined = undefined;
    curProgress = 0;
    maxProgress = 0;

    levelProgressCnt = 0; //关卡总进度

    //构建地图
    buildMap (jsonInfo: any, progressCb?: Function, completeCb?: Function) {
        this._progressListener = progressCb;
        this._completeListener = completeCb;
        this.objMap = jsonInfo as IObjMap;
        //构建地面
        this.curProgress = 0;
        this.maxProgress = 6;

        this.buildModel('plane');
        this.buildModel('road');
        this.buildModel('tree');
        this.buildModel('house');
        this.buildModel('sign');
        this.buildPath();
    }

    buildModel (type: RoadType) {
        if (!this.objMap.hasOwnProperty(type)) {
            //继续
            this.triggerFinished(type);
            return;
        }

        //搜索所需资源
        let arrName = [];
        let objPlane = this.objMap[type] as MapModelData;
        for (let idx = 0; idx < objPlane.children.length; idx++) {
            let name = objPlane.children[idx].name;
            if (arrName.indexOf(name) === -1) {
                arrName.push(name);
            }
        }

        let dictPrefab: { [name: string]: Prefab } = {};
        resourceUtil.getMapObjs(type, arrName, ()=>{}, (err, arrPrefabs)=>{
            if (err) {
                console.error(err);
                return;
            }

            for (let idx = 0; idx < (arrPrefabs as Prefab[]).length; idx++) {
                let prefab = (arrPrefabs as Prefab[])[idx];
                dictPrefab[prefab.data.name] = prefab;
            }

            //开始创建
            //先创建父节点
            let nodeParent = new Node(type);
            nodeParent.parent = this.node;
            nodeParent.setPosition(new Vec3(objPlane.pX, objPlane.pY, objPlane.pZ));

            //开始创建子节点
            for (let idx = 0; idx < objPlane.children.length; idx++) {
                let child = objPlane.children[idx];
                let prefab = dictPrefab[child.name];
                let node = poolManager.instance.getNode(prefab, nodeParent);
                node.setPosition(child.pX, child.pY, child.pZ);
                node.eulerAngles = new Vec3(child.rX, child.rY, child.rZ);
                node.setScale(child.sX, child.sY, child.sZ);
            }

            this.triggerFinished(type);
        });
    }

    buildPath () {
        if (!this.objMap.hasOwnProperty('path')) {
            //继续
            return;
        }

        this.path = [];
        this.levelProgressCnt = 0;
        let objPathRoot = this.objMap.path as MapPathData;
        let nodePathRoot = new Node('path');
        nodePathRoot.parent = this.node;
        nodePathRoot.setPosition(objPathRoot.pX, objPathRoot.pY, objPathRoot.pZ);

        //开始创建各条路径
        for (let idx = 0; idx < objPathRoot.children.length; idx++) {
            let objPath = objPathRoot.children[idx] as PathData;
            let nodePath = new Node(objPath.name);
            nodePath.parent = nodePathRoot;
            nodePath.setPosition(objPath.pX, objPath.pY, objPath.pZ);


            //开始递归创建路径
            let start = this.createRoadPoint(objPath.path, nodePath);
            if (start) {
                this.path.push(start);
            }
        }

        this.triggerFinished('path');
    }

    createRoadPoint (objPoint: ObjRoadPoint | null, parent: Node | null) {
        if (!objPoint) {
            return null;
        }

        let nodeRoadPoint = new Node(objPoint.name);
        nodeRoadPoint.parent = parent;
        nodeRoadPoint.setPosition(objPoint.pX, objPoint.pY, objPoint.pZ);
        nodeRoadPoint.setScale(objPoint.sX, objPoint.sY, objPoint.sZ);
        nodeRoadPoint.eulerAngles = new Vec3(objPoint.rX, objPoint.rY, objPoint.rZ);
        let point = nodeRoadPoint.addComponent(roadPoint);
        point.type = objPoint.type;
        point.moveType = objPoint.moveType;
        point.clockwise = objPoint.clockwise;
        point.direction = objPoint.direction;
        point.delayTime = objPoint.delayTime;
        point.genInterval = objPoint.genInterval;
        point.carSpeed = objPoint.carSpeed;
        point.cars = objPoint.cars;

        if (point.type === fightConstants.ROAD_POINT_TYPE.PLATFORM) {
            this.levelProgressCnt++;
        }


        if (objPoint.next) {
            point.next = this.createRoadPoint(objPoint.next, parent);
        }

        return nodeRoadPoint;
    }

    triggerFinished(type: RoadType) {
        // console.log(`build ${type} finished!`);

        let tips = '';
        switch (type) {
            case 'plane':
                    tips = i18n.t('fightMap.trimTheGround');
                break;
            case 'road':
                    tips = i18n.t('fightMap.pavingTheRoad');
                break;
            case 'tree':
                    tips = i18n.t('fightMap.plantingTree');
                break;
            case 'house':
                    tips = i18n.t('fightMap.decorateHouse');
                break;
            case 'sign':
                    tips = i18n.t('fightMap.paintLandmarks');
                break;
        }

        if (tips) {
            clientEvent.dispatchEvent('updateLoading', 10, tips);
        }

        this.curProgress++;
        if (this._progressListener) {
            this._progressListener(this.curProgress, this.maxProgress);
        }

        if (this.curProgress >= this.maxProgress && this._completeListener) {
            this._completeListener();
        }
    }

    recycle () {
        // console.log('recycle map elements...');

        this.recycleModel('plane');
        this.recycleModel('road');
        this.recycleModel('tree');
        this.recycleModel('house');
        this.recycleModel('sign');

        //路径属于空节点挂脚本，直接做清除操作
        this.node.removeAllChildren();
    }

    recycleModel(type: RoadType) {
        let nodeParent = this.node.getChildByName(type);
        if (!nodeParent) {
            return;
        }

        for (let idx = 0; idx < nodeParent.children.length; idx++) {
            let child = nodeParent.children[idx];
            poolManager.instance.putNode(child);
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
