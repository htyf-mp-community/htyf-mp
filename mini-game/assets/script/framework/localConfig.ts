// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component } from "cc";
import { resourceUtil } from "./resourceUtil";
import { csvManager } from "./csvManager";
import { ICarInfo } from "./constant";
const { ccclass, property } = _decorator;

@ccclass("localConfig")
export class localConfig {
    /* class member could be defined like this */
    static _instance: localConfig;
    csvManager: csvManager | null = null;
    arrCars: ICarInfo[] = [];

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new localConfig();
        return this._instance;
    }

    _callback: Function | null = null;
    _skills: any = {};
    currentLoad = 0;
    cntLoad = 0;
    servers: any = [];

    loadConfig (cb: Function) {
        this._callback = cb;
        this.csvManager = new csvManager();
        this.loadCSV();
    }

    loadCSV () {
        //新增数据表 请往该数组中添加....
        var arrTables = ['talk', 'car', 'signIn'];
        this.cntLoad = arrTables.length + 1; //+1主要是后续还有技能配置的加载，特殊处理

        //客户端加载
        arrTables.forEach((tableName, index, array)=> {
            resourceUtil.getData(tableName, (err, content) => {
                this.csvManager!.addTable(tableName, content);
                this.tryToCallbackOnFinished();
            });
        });

        //载入技能配置信息
        // resourceUtil.getData("skills", function (err, content) {
        //     _this._skills = JSON.parse(content);
        //     _this.tryToCallbackOnFinished();
        // });

        resourceUtil.getJsonData("servers", (err, content)=> {
            this.servers = content;
            this.tryToCallbackOnFinished();
        });
    }

    queryOne (tableName: string, key: string, value: any) {
        return this.csvManager!.queryOne(tableName, key, value);
    }

    queryByID (tableName: string, ID: string) {
        return this.csvManager!.queryByID(tableName, ID);
    }

    getTable (tableName: string) {
        return this.csvManager!.getTable(tableName);
    }

    getTableArr (tableName: string) {
        return this.csvManager!.getTableArr(tableName);
    }

    getCars () {
        if (this.arrCars.length > 0) {
            return this.arrCars;
        }

        let arr = localConfig.instance.getTableArr('car') as any[];
        this.arrCars = arr.sort((elementA, elementB)=>{
            return elementA.sort - elementB.sort
        });

        return this.arrCars;
    }

    // 选出指定表里面所有有 key=>value 键值对的数据
    queryAll (tableName: string, key: string, value: any) {
        return this.csvManager!.queryAll(tableName, key, value);
    }

    // 选出指定表里所有 key 的值在 values 数组中的数据，返回 Object，key 为 ID
    queryIn (tableName: string, key: string, values: Array<any>) {
        return this.csvManager!.queryIn(tableName, key, values);
    }

    // 选出符合条件的数据。condition key 为表格的key，value 为值的数组。返回的object，key 为数据在表格的ID，value为具体数据
    queryByCondition (tableName: string, condition: any) {
        return this.csvManager!.queryByCondition(tableName, condition);
    }

    tryToCallbackOnFinished () {
        if (this._callback) {
            this.currentLoad++;
            if (this.currentLoad >= this.cntLoad) {
                this._callback();
            }
        }
    }

    getCurrentServer () {
        return this.servers[0];
    }

    getVersion () {
        let server = this.getCurrentServer();
        let version = server ? server.version : 'unknown';
        return version;
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
