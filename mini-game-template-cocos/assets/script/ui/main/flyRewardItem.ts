import { _decorator, Component, Sprite, Vec3, tweenUtil, SpriteFrame, tween } from "cc";
const { ccclass, property } = _decorator;

@ccclass("flyRewardItem")
export class flyRewardItem extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    targetPos: Vec3 = new Vec3();
    targetRotation: Vec3 = new Vec3(0, 0, 0);
    targetScale: Vec3 = new Vec3(1, 1, 1);
    posLast = new Vec3()
    _callback: Function | null = null;

    start () {
        // Your initialization goes here.
    }

    show (imgItem: SpriteFrame, posLast: Vec3, callback: Function) {
        this.posLast.set(posLast);
        this._callback = callback;
        let sprite = this.node.addComponent(Sprite);
        sprite.trim = false;
        sprite.sizeMode = Sprite.SizeMode.RAW;

        sprite.spriteFrame = imgItem;

        this.node.eulerAngles =  new Vec3(0, 0, Math.floor(Math.random()*360));
        this.targetRotation = new Vec3(this.node.eulerAngles);

        //每个去配个动作
        // let randDegree = Math.floor(Math.random()*360);

        let randTargetPos = new Vec3(Math.floor(Math.random()*300) - 150, Math.floor(Math.random()*300) - 150, 0);

        let costTime = Vec3.distance(randTargetPos, new Vec3(0, 0, 0)) / 400;
        tween(this.targetPos)
        //    .to(costTime, randTargetPos, {easing: 'Circular-InOut'})
            .to(costTime, randTargetPos, {easing: 'cubicInOut'})
            .start();


        let randRotation = 120 + Math.floor(Math.random()*60);
        randRotation = this.targetRotation.z + Math.floor(Math.random()*2) === 1? randRotation: -randRotation;
        tween(this.targetRotation)
            .to(costTime, new Vec3(0, 0, randRotation))
            .start();

        tween(this.targetScale)
            .to(costTime * 2 / 3, new Vec3(1.4, 1.4, 1.4))
            .to(costTime / 3, new Vec3(1, 1, 1))
            .call(()=>{
                this.move2Target();
            })
            .start();
    }

    move2Target () {
        let move2TargetTime = Vec3.distance(this.node.position, this.posLast) / 1500;

        let delayTime = Math.floor(Math.random()*10) / 10; //0~1s
        tween(this.targetScale)
            .to(0.3, new Vec3(1.4, 1.4, 1.4))
            .to(0.7, new Vec3(1, 1, 1)).union()
            .repeat(50)
            .start();

        this.scheduleOnce(()=>{
            tween(this.targetPos)
                .to(move2TargetTime, this.posLast)
                .call(()=>{
                    //飞行结束
                    this._callback && this._callback(this.node);
                })
                .start();
        }, delayTime);


    }

    update (deltaTime: number) {
        // Your update function goes here.
        this.node.position = this.targetPos;

        this.node.eulerAngles = this.targetRotation;

        this.node.setScale(this.targetScale);
    }
}
