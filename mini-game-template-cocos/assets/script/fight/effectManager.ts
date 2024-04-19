import { _decorator, Component, Prefab, Node } from "cc";
import { carManager } from "./carManager";
import { clientEvent } from "../framework/clientEvent";
import { poolManager } from "../framework/poolManager";
import { audioManager } from "../framework/audioManager";
import { constant } from "../framework/constant";
const { ccclass, property } = _decorator;

@ccclass("effectManager")
export class effectManager extends Component {
    /* class member could be defined like this */
    // dummy = '';

    @property({type: Prefab})
    pfTailLine: Prefab = null!;

    @property({type: carManager})
    carManager: carManager = null!;
    currentNode: Node | null = null;

    start () {
        // Your initialization goes here.
    }

    onEnable () {
        clientEvent.on('startBraking', this.onBrakingStart, this);
        clientEvent.on('endBraking', this.onBrakingEnd, this);
    }

    onDisable () {
        clientEvent.off('startBraking', this.onBrakingStart, this);
        clientEvent.off('endBraking', this.onBrakingEnd, this);
    }

    onBrakingStart() {

        this.currentNode = poolManager.instance.getNode(this.pfTailLine, this.node);
        this.currentNode.setWorldPosition(this.carManager.mainCar.node.worldPosition);
        this.currentNode.eulerAngles = this.carManager.mainCar.node.eulerAngles;

        audioManager.instance.playSound(constant.AUDIO_SOUND.STOP);
    }

    onBrakingEnd () {

        let node = this.currentNode;
        this.currentNode = null;
        this.scheduleOnce(()=>{
            if (node && node.isValid) {
                poolManager.instance.putNode(node);
            }
        }, 2);
    }

    update (deltaTime: number) {

        // Your update function goes here.
        if (this.currentNode && this.carManager.mainCar) {
            this.currentNode.setWorldPosition(this.carManager.mainCar.node.worldPosition);
            this.currentNode.eulerAngles = this.carManager.mainCar.node.eulerAngles;
        }
    }

    reset () {
        if (this.currentNode) {

            poolManager.instance.putNode(this.currentNode);
            poolManager.instance.clearPool(this.currentNode.name);
            this.currentNode = null;

            //原有的都释放掉
            let arr = this.node.children.slice(0);
            for (let idx = 0; idx < arr.length; idx++) {
                let node = arr[idx];
                if (node && node.isValid) {
                    node.destroy();
                }
            }
        }
    }
}
