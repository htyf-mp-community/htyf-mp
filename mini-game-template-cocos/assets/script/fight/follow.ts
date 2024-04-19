// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Vec3, Quat, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("follow")
export class follow extends Component {
    // Property.
    // yourProperty = "some what";

    // Add `property` decorator if your want the property to be serializable.
    // @property
    // yourSerializableProperty = "some what";
    @property({type: Node})
    public followTarget: Node | null = null;

    @property
    public isFollowRotation = true;

    @property
    public offset = new Vec3();
    public moveSpeed = 3;

    isPlayingStart = false;

    constructor() {
        super();
    }

    public start() {
        // Your initialization goes here.
        // this.showStart();
    }

    public showStart () {
        //TODO 原先有个展示动画，现直接修改为玩家下
        // this.isPlayingStart = true;
        // this.scheduleOnce(()=>{
        //     this.isPlayingStart = false;
        // }, 1.5);
    }

    public lateUpdate(deltaTime: number) {
        if (!this.followTarget) {
            return;
        }

        let posOrigin = this.node.worldPosition;

        if (!this.isPlayingStart) {
            let offset = this.offset;
            if (this.isFollowRotation) {
                offset = Vec3.transformQuat(new Vec3(), this.offset, this.followTarget.rotation);
            }
            let posTarget = new Vec3(this.followTarget.worldPosition.x + offset.x, this.followTarget.worldPosition.y + offset.y, this.followTarget.worldPosition.z + offset.z);

            // let dis = Vec3.subtract(new Vec3(), posOrigin, posTarget).length();

            this.node.setWorldPosition(posTarget);
            this.node.lookAt(this.followTarget.worldPosition, new Vec3(0, 1, 0));

            if (this.isFollowRotation) {
                let angle = new Vec3( this.node.eulerAngles );
                angle.y = this.followTarget.eulerAngles.y;
                this.node.eulerAngles = angle;
            }

        } else {
            let posTarget = new Vec3(this.followTarget.worldPosition.x + this.offset.x, this.followTarget.worldPosition.y + this.offset.y, this.followTarget.worldPosition.z + this.offset.z);

            let dis = Vec3.subtract(new Vec3(), posOrigin, posTarget).length();
            if (dis > 0.001) {
                Vec3.lerp(posTarget, posOrigin, posTarget, this.moveSpeed * deltaTime);
            }

            this.node.setWorldPosition(posTarget);
            this.node.lookAt(this.followTarget.worldPosition, new Vec3(0, 1, 0));
        }

    }
}
