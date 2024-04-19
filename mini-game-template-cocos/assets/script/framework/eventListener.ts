// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { error, log, _decorator } from "cc";
const { ccclass, property } = _decorator;

interface IEvent{
    handler: Function;
    target?: Node
}

type EventList = { [name: string]: IEvent};

@ccclass("oneToOneListener")
class oneToOneListener {
    supportEvent: any = {}
    handle: EventList = {};

    constructor(){
        this.supportEvent = null;
    }

    on (eventName: string, handler: Function, target: Node) {
        this.handle[eventName] = { handler: handler, target: target };
    }

    off (eventName: string, handler: Function) {
        const oldObj = this.handle[eventName];
        if (oldObj && oldObj.handler && oldObj.handler === handler) {
            delete this.handle[eventName];
        }
    }

    dispatchEvent (eventName: string) {
        if (this.supportEvent !== null && !this.supportEvent.hasOwnProperty(eventName)) {
            error("please add the event into clientEvent.js");
            return;
        }

        const objHandler = this.handle[eventName];
        const args = [];
        for (let i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        if (objHandler.handler) {
            objHandler.handler.apply(objHandler.target, args);
        } else {
            log("not register " + eventName + "    callback func");
        }
    }

    setSupportEventList (arrSupportEvent: string[]) {
        if (!(arrSupportEvent instanceof Array)) {
            error("supportEvent was not array");
            return false;
        }

        this.supportEvent = {};
        for (let i in arrSupportEvent) {
            const eventName = arrSupportEvent[i];
            this.supportEvent[eventName] = i;
        }

        return true;
    }
};


@ccclass("eventListener")
export class eventListener {
    public static getBaseClass (type:string) {
        return oneToOneListener;
    }
}
