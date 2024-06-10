import { _decorator, Component, Node, Animation, SpriteFrame, find, Vec3 } from "cc";
import { clientEvent } from "../../framework/clientEvent";
import { flyRewardItem } from "./flyRewardItem";
const { ccclass, property } = _decorator;

const MAX_REWARD_COUNT = 10;

@ccclass("flyReward")
export class flyReward extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property(SpriteFrame)
    imgGold: SpriteFrame = null!;

    @property(Node)
    ndRewardParent: Node = null!;

    @property(Animation)
    aniBoom: Animation = null!;

    finishIdx: number = 0;
    _callback: Function | undefined = undefined;
    isGoldOrDiamond: boolean = true;


    start () {
        // Your initialization goes here.
        this.aniBoom.play();

        this.createReward();
    }

    getTargetPos () {
        let nodeGold = find('Canvas/goldPos') as Node;

        if (!nodeGold) {
            this.node.destroy();

            if (this._callback) {
                this._callback();
            }

            return Vec3.ZERO;
        }


        return nodeGold.position;
    }

    createReward () {
        let imgReward = this.imgGold;
        // if (!this.isGoldOrDiamond) {
        //     imgReward = this.imgDiamond;
        // }

        let targetPos = this.getTargetPos();
        for (var idx = 0; idx < MAX_REWARD_COUNT; idx++) {
            let rewardNode = new Node('flyRewardItem');
            let flyItem = rewardNode.addComponent(flyRewardItem);
            rewardNode.parent = this.ndRewardParent;
            rewardNode.layer = this.ndRewardParent.layer;
            flyItem.show(imgReward, targetPos, (node: Node)=>{
                this.onFlyOver(node);
            })
        }
    }

    setInfo (isGoldOrDiamond: boolean) {
        this.isGoldOrDiamond = isGoldOrDiamond;
    }

    onFlyOver (node: Node) {
        if (this.isGoldOrDiamond) {
            clientEvent.dispatchEvent('receiveGold');
        } else {
            clientEvent.dispatchEvent('receiveDiamond');
        }

        // cc.gameSpace.audioManager.playSound('sell', false);
        node.active = false;
        this.finishIdx++;
        if (this.finishIdx === MAX_REWARD_COUNT) {
            if (this._callback) {
                this._callback();
            }

            this.node.destroy();
        }
    }

    /**
     * 设置播放回调
     * @param {Function} callback
     * @param {Object} target
     */
    setEndListener (callback?: Function) {
        this._callback = callback;
    }

}
