// Learn Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Event } from "cc";
const { ccclass, property } = _decorator;

@ccclass("blockInputEvent")
export class blockInputEvent extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    onEnable () {
        this.node.on(Node.EventType.TOUCH_START, this.stopPropagation, this);

        this.node.on(Node.EventType.TOUCH_END, this.stopPropagation, this);

        this.node.on(Node.EventType.TOUCH_MOVE, this.stopPropagation, this);

        this.node.on(Node.EventType.TOUCH_CANCEL, this.stopPropagation, this);

        this.node.on(Node.EventType.MOUSE_DOWN, this.stopPropagation, this);

        this.node.on(Node.EventType.MOUSE_ENTER, this.stopPropagation, this);

        this.node.on(Node.EventType.MOUSE_MOVE, this.stopPropagation, this);

        this.node.on(Node.EventType.MOUSE_LEAVE, this.stopPropagation, this);

        this.node.on(Node.EventType.MOUSE_UP, this.stopPropagation, this);

        this.node.on(Node.EventType.MOUSE_WHEEL, this.stopPropagation, this);
    }

    onDisable () {
        this.node.off(Node.EventType.TOUCH_START, this.stopPropagation, this);

        this.node.off(Node.EventType.TOUCH_END, this.stopPropagation, this);

        this.node.off(Node.EventType.TOUCH_MOVE, this.stopPropagation, this);

        this.node.off(Node.EventType.TOUCH_CANCEL, this.stopPropagation, this);

        this.node.off(Node.EventType.MOUSE_DOWN, this.stopPropagation, this);

        this.node.off(Node.EventType.MOUSE_ENTER, this.stopPropagation, this);

        this.node.off(Node.EventType.MOUSE_MOVE, this.stopPropagation, this);

        this.node.off(Node.EventType.MOUSE_LEAVE, this.stopPropagation, this);

        this.node.off(Node.EventType.MOUSE_UP, this.stopPropagation, this);

        this.node.off(Node.EventType.MOUSE_WHEEL, this.stopPropagation, this);
    }

    stopPropagation (event: Event) {
        event.propagationImmediateStopped = true;
        event.propagationStopped = true;
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
