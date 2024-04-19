import { _decorator, Component, Vec3, Node, Collider, RigidBody, ICollisionEvent, instantiate, ParticleSystem, ERigidBodyType } from "cc";
import { roadPoint } from "./roadPoint";
import { fightConstants } from "./fightConstants";
import { customerManager } from "./customerManager";
import { clientEvent } from "../framework/clientEvent";
import { audioManager } from "../framework/audioManager";
import { constant } from "../framework/constant";
import { resourceUtil } from "../framework/resourceUtil";
import { poolManager } from "../framework/poolManager";
const { ccclass, property } = _decorator;

const TOOTING_COOL_TIME = 5;   //5s后才会再次鸣笛

@ccclass("car")
export class car extends Component {
    set isMoving (value) {
        this._isMoving = value;

        this.updateBackLight();
    }

    get isMoving () {
        return this._isMoving;
    }

    _isMoving = false;
    @property({displayName: '最大移动速度'})
    public maxSpeed = 2;

    @property({displayName: '最小移动速度'})
    minSpeed = 0.2;

    @property(Node)
    nodeGas: Node = null!; //尾气

    _minSpeed = -1;//用来做存储
    _maxSpeed = -1;  //用来存储

    public manager: customerManager | null = null;
    public isMain = false;

    currentSpeed = 0;
    accelerate = 2;
    originRotation = 0;
    targetRotation = 0;
    curRoadPoint: roadPoint | null = null;
    circleCenterPoint = new Vec3();
    quarter = 0;

    _nodeGasInst: ParticleSystem | null = null;

    entry: Node | null = null;

    forward: Vec3 = new Vec3(0, 0, -1);
    posTarget: Vec3 = new Vec3();
    posSrc = new Vec3();
    _callback: Function | null = null;

    isOver = false;
    curProgress = 0;
    maxProgress = 0;
    hasCustomer = false;
    lastPos = new Vec3();
    lastRotation = new Vec3();

    isBraking = false;
    arrTyres: any = [];
    curTyreRotation = 0;
    nodeCarBackLight: Node | null = null; //车尾灯
    tootingCoolTime = 0;           //喇叭声的冷却时间

    isCarMoving = false; //每帧检测车辆是否在移动中

    nodeInvincible: Node | null = null;    //无敌特效

    //是否正在接客
    set isHosting (value) {
        this._isHosting = value;

        this.updateBackLight();
    }

    get isHosting () {
        return this._isHosting;
    }

    _isHosting = false;

    _isInvincible = false; //是否处于无敌状态

    invincibleRotation = 0;

    set isInvincible (isShow) {
        this._isInvincible = isShow;

        if (isShow) {
            if (this.nodeInvincible) {
                //已经存在该特效
                this.nodeInvincible.active = true;
                return;
            } else {
                resourceUtil.getEffect('shield', (err, prefab)=>{
                    if (err) {
                        console.error(err);
                        return;
                    }

                    this.nodeInvincible = instantiate(prefab);
                    this.nodeInvincible.parent = this.node;
                });
            }
        } else {
            if (this.nodeInvincible) {
                this.nodeInvincible.destroy();
                this.nodeInvincible = null;
            }
        }
    }

    get isInvincible () {
        return this._isInvincible;
    }

    constructor() {
        super();
    }

    public start() {
        // Your initialization goes here.
        this._minSpeed = this.minSpeed;
        this._maxSpeed = this.maxSpeed;

        let tyre1 = this.node.getChildByPath('RootNode/tyre1');
        if (tyre1) {
            this.arrTyres = [
                tyre1,
                this.node.getChildByPath('RootNode/tyre2'),
                this.node.getChildByPath('RootNode/tyre3'),
                this.node.getChildByPath('RootNode/tyre4'),
            ]

            this.nodeCarBackLight = this.node.getChildByPath('RootNode/light1');
        }

        //异步加载尾气,不需要每个都去创建一个
        resourceUtil.getEffect('gas', (err, prefab)=>{
            if (err) {
                return;
            }

            const gas = poolManager.instance.getNode(prefab, this.nodeGas) as Node;
            this._nodeGasInst = gas.getComponent(ParticleSystem)!;
            gas.setPosition(new Vec3(0, 0, 0));
        });
    }

    /**
     * 标记为主车
     */
    markMainCar (isMain: boolean) {
        this.isMain = isMain;

        let rigidBody = this.node.getComponent(RigidBody) as RigidBody;
        let collider = this.node.getComponent(Collider)!;

        collider.off("onCollisionEnter", this.onCollisionEnter, this);
        if (isMain) {
            rigidBody.setGroup(fightConstants.CAR_GROUP.MAIN_CAR);
            rigidBody.setMask(fightConstants.CAR_GROUP.OTHER_CAR);
            rigidBody.type = ERigidBodyType.KINEMATIC;

            collider.on("onCollisionEnter", this.onCollisionEnter, this);
        } else {
            rigidBody.setGroup(fightConstants.CAR_GROUP.OTHER_CAR);
            rigidBody.setMask(-1);
            rigidBody.type = ERigidBodyType.DYNAMIC;
        }
    }

    setEntry (entry: Node) {
        this.entry = entry;

        this.reset();
    }

    onCollisionEnter (event: ICollisionEvent) {
        if (!this.isMain) {
            return;
        }

        if (event.otherCollider.node.name === 'ground') {
            return;
        }

        let nodeEnemy = event.otherCollider.node;
        if (event.otherCollider.node === this.node) {
            nodeEnemy = event.selfCollider.node;
        }


        let car = nodeEnemy.getComponent('car') as car;
        if (!car.isOver) {
            car.isOver = true;//标准这辆车出车祸了
            let enemyRigidBody = nodeEnemy.getComponent(RigidBody)!;
            enemyRigidBody.useGravity = true;
            if (!this.isInvincible) {
                enemyRigidBody.applyForce(new Vec3(0, 1500, -3000), new Vec3(0, 0.5, 0));
            } else {
                enemyRigidBody.applyForce(new Vec3(0, 10000, -3000), new Vec3(0, 0.5, 0));
            }
        }

        if (this.isOver) {
            return;
        }

        audioManager.instance.playSound(constant.AUDIO_SOUND.CRASH);

        let rigidBody = this.node.getComponent(RigidBody);
        if (this.isInvincible) {
            this.lastPos = this.node.worldPosition;
            this.lastRotation = this.node.eulerAngles;

            rigidBody.enabled = false;
            //将物理引擎中的速度置为0
            this.scheduleOnce(()=>{
                this.isInvincible = false;
                rigidBody.enabled = true;

                 //修复无敌状态时撞到AI小车导致bug
                this.revive();
                this.currentSpeed = this._minSpeed;
            }, 0.1);

            this.scheduleOnce(()=>{
                poolManager.instance.putNode(nodeEnemy);
            }, 0.3);

            return;
        }

        //发生碰撞，游戏结束，记录下最后的车辆信息
        this.lastPos = this.node.worldPosition;
        this.lastRotation = this.node.eulerAngles;

        this.isOver = true;

        // rigidBody.useGravity = true;

        rigidBody.setGroup(fightConstants.CAR_GROUP.MAIN_CAR);
        rigidBody.setMask(fightConstants.CAR_GROUP.OTHER_CAR | fightConstants.CAR_GROUP.NORMAL);


        clientEvent.dispatchEvent('gameOver', false);
    }

    updateBackLight () {
        if (this.nodeCarBackLight) {
            this.nodeCarBackLight.active = !this.isMoving || this.isHosting;
        }
    }


    public startRunning () {
        if (this.isOver) {
            return;
        }

        this.isMoving = true;

        this.accelerate = 0.4;

        if (this._nodeGasInst) {
            this._nodeGasInst.play();
        }

        if (this.isBraking) {
            clientEvent.dispatchEvent('endBraking');
            this.isBraking = false;
        }
    }

    public startWithMinSpeed () {
        this.currentSpeed = this.minSpeed;
        this.stopRunning(true);

        if (this._nodeGasInst) {
            this._nodeGasInst.play();
        }

        // if (this.isMain) {
        //     this.isInvincible = true;
        // }
    }

    public stopRunning (isInit?: boolean) {
        if (this.isOver) {
            return;
        }

        this.isMoving = false;

        this.accelerate = -0.15;
        if (!this.isBraking && !isInit) {
            clientEvent.dispatchEvent('startBraking');
            this.isBraking = true;
        }
    }

    public stopImmediately () {
        this.isMoving = false;
        this.currentSpeed = 0;
    }

    public setMoveOverListener(callback: (...args: any[]) => void) {
        this._callback = callback;
    }

    public resetPhysical () {
        this.isOver = false;
        if (this.isMain) {
            this.markMainCar(true);
        }

        //初始化物理引擎相关信息
        let rigidBody = this.node.getComponent(RigidBody)!;
        rigidBody.useGravity = false;
        //将物理引擎中的速度置为0
        rigidBody.sleep();
        rigidBody.wakeUp();
    }

    public revive () {
        //复活
        this.resetPhysical();

        console.log("revive pos ", this.lastPos);

        let lastPos = new Vec3(this.lastPos.x, 0, this.lastPos.z);

        this.node.setWorldPosition(lastPos);

        this.node.eulerAngles = this.lastRotation;

        this.isMoving = false;
        this.currentSpeed = 0;
    }

    public reset () {
        //获得对应路径，但目前我们只做了主路的，所以先用主路线,主路线默认索引为0
        this.resetPhysical();

        if (this.isMain) {
            this.curProgress = 0;
            this.hasCustomer = false;

            if (this._nodeGasInst) {
                this._nodeGasInst.stop();
            }

            this.isInvincible = false;
        }

        this.tootingCoolTime = 0;
        this.curRoadPoint = this.entry!.getComponent('roadPoint') as roadPoint;
        this.posSrc.set(this.entry!.worldPosition);
        this.posTarget.set(this.curRoadPoint.next!.worldPosition);

        //初始化位置
        this.node.setWorldPosition(this.entry!.worldPosition);

        //初始化旋转角度
        if (this.posTarget.z !== this.posSrc.z) {
            if (this.posTarget.z < this.posSrc.z) {
                //向上
                this.node.eulerAngles = new Vec3(0, 360, 0);
            } else {
                //向下
                this.node.eulerAngles = new Vec3(0, 180, 0);
            }
        } else {
            if (this.posTarget.x > this.posSrc.x) {
                //向上
                this.node.eulerAngles = new Vec3(0, 270, 0);
            } else {
                //向下
                this.node.eulerAngles = new Vec3(0, 90, 0);
            }
        }

        this.originRotation = this.node.eulerAngles.y;
        this.targetRotation = this.originRotation;

        this.isMoving = false;
        this.isHosting = false;
        this.currentSpeed = 0;

        if (this._minSpeed > 0) {
            this.minSpeed = this._minSpeed;
            this.maxSpeed = this._maxSpeed;
        }

    }

    /**
     * 接客
     */
    public greeting () {
        this.isHosting = true;

        this.curProgress++;
        this.hasCustomer = true;

        clientEvent.dispatchEvent('greetingCustomer');

        //随机个乘客给它
        this.manager!.greeting(this.node.worldPosition, this.curRoadPoint!.direction, ()=>{
            this.isMoving = false;
            this.currentSpeed = 0;
            this.isHosting = false;

            clientEvent.dispatchEvent('showGuide', true);
        });
    }

    /**
     * 送客
     */
    public takeCustomer () {
        this.isHosting = true;

        this.hasCustomer = false;

        clientEvent.dispatchEvent('takeCustomer');

        //送客
        this.manager!.takeCustomer(this.node.worldPosition, this.curRoadPoint!.direction, this.curProgress === this.maxProgress, ()=>{
            this.isMoving = false;
            this.currentSpeed = 0;
            this.isHosting = false;

            clientEvent.dispatchEvent('showGuide', true);
        })
    }

    public arrivalPoint () {
        this.node.setWorldPosition(this.posTarget);

        if (this.curRoadPoint!.moveType === fightConstants.ROAD_MOVE_TYPE.BEND) {
            //如果是曲线，则需要将其旋转角度转正
            this.node.eulerAngles = new Vec3(0, this.targetRotation, 0);
        }


        //切换至下一个目标点
        this.posSrc.set(this.posTarget);
        this.posTarget.set(Vec3.ZERO);
        if (this.curRoadPoint!.next) {
            this.curRoadPoint = this.curRoadPoint!.next.getComponent('roadPoint') as roadPoint;

            //todo 切换新的点，看是否是接客或者下客
            if (this.isMain) {
                if (this.curRoadPoint.type === fightConstants.ROAD_POINT_TYPE.GREETING) {
                    this.greeting();
                } else if (this.curRoadPoint.type === fightConstants.ROAD_POINT_TYPE.PLATFORM) {
                    this.takeCustomer();
                } else if (this.curRoadPoint.type === fightConstants.ROAD_POINT_TYPE.END) {
                    //结束点，触发下
                    clientEvent.dispatchEvent('gameOver', true);
                    this.moveAfterFinished();
                }
            }

            if (this.curRoadPoint.next) {
                this.posTarget.set(this.curRoadPoint.next.worldPosition);
            } else {
                //表示没有接下来的点，执行结束了
                this._callback && this._callback(this);//行走完后回调
            }

            this.originRotation = this.node.eulerAngles.y;
            this.targetRotation = this.originRotation;

            if (this.curRoadPoint.moveType === fightConstants.ROAD_MOVE_TYPE.BEND) {
                //属于转弯的
                //确定下半圆的中间点
                if (this.curRoadPoint.clockwise) {
                    //顺时针 -90
                    this.originRotation = this.originRotation <= 0 ? 360 + this.originRotation : this.originRotation;
                    this.targetRotation = this.originRotation - 90;
                    //顺时针旋转
                    if ((this.posTarget.x > this.posSrc.x && this.posTarget.z < this.posSrc.z) ||
                    (this.posTarget.x < this.posSrc.x && this.posTarget.z > this.posSrc.z)) {
                        //第一区域与第三区域
                        this.circleCenterPoint = new Vec3(this.posTarget.x, 0, this.posSrc.z);
                    } else {
                        this.circleCenterPoint = new Vec3(this.posSrc.x, 0, this.posTarget.z);
                    }

                    let r = Vec3.subtract(new Vec3(),this.circleCenterPoint, this.posSrc).length();
                    // this.circleCenterPoint.sub(this.posSrc).mag();
                    this.quarter = 90 / (Math.PI * r / 2); //相当于1米需要旋转多少度
                } else {
                    this.originRotation = this.originRotation >= 360 ? this.originRotation - 360 : this.originRotation;
                    this.targetRotation = this.originRotation + 90;

                    //逆时针旋转
                    if ((this.posTarget.x > this.posSrc.x && this.posTarget.z < this.posSrc.z) ||
                    (this.posTarget.x < this.posSrc.x && this.posTarget.z > this.posSrc.z)) {
                        //第一区域与第三区域
                        this.circleCenterPoint = new Vec3(this.posSrc.x, 0, this.posTarget.z);
                    } else {
                        this.circleCenterPoint = new Vec3(this.posTarget.x, 0, this.posSrc.z);
                    }

                    let r = Vec3.subtract(new Vec3(),this.circleCenterPoint, this.posSrc).length();
                    this.quarter = 90 / (Math.PI * r / 2); //相当于1米需要旋转多少度
                }

                //将旋转角度重置为正常角度
                this.node.eulerAngles = new Vec3(0, this.originRotation, 0);

                // this.circleCenterPoint = Vec3(this.posTarget.x,
            }

        } else {
            this.curRoadPoint = null;

            this._callback && this._callback(this);//行走完后回调
        }

    }

    public update(deltaTime: number) {
        //无敌特效相关
        if (this.nodeInvincible) {
            this.invincibleRotation += deltaTime * 200; //每帧转动多少
            if (this.invincibleRotation > 360) {
                this.invincibleRotation -= 360;
            }

            this.nodeInvincible.eulerAngles = new Vec3(this.invincibleRotation, 0, 0);
        }

        //喇叭
        if (this.tootingCoolTime > 0) {
            this.tootingCoolTime = this.tootingCoolTime > deltaTime ? this.tootingCoolTime - deltaTime : 0;
        }

        //车辆移动相关
        if ((!this.isMoving && this.currentSpeed < 0.01) || this.posTarget.equals(Vec3.ZERO) || this.isHosting || this.isOver) {
            this.isCarMoving = false;
            return;
        }

        this.isCarMoving = true;
        this.currentSpeed += this.accelerate * deltaTime;
        this.currentSpeed = this.currentSpeed > this.maxSpeed ? this.maxSpeed : this.currentSpeed;
        if (this.currentSpeed < this.minSpeed) {
            this.currentSpeed = this.minSpeed;
            if (this.isBraking) {
                clientEvent.dispatchEvent('endBraking');
                this.isBraking = false;
            }
        }

        if (this.arrTyres.length > 0) {
            this.curTyreRotation -= this.currentSpeed * 200;
            if (this.curTyreRotation < -360) {
                this.curTyreRotation += 360;
            }

            let rotation = new Vec3(this.curTyreRotation, 0);
            for (let idx = 0; idx < this.arrTyres.length; idx++) {
                let tyre = this.arrTyres[idx] as Node;
                tyre.eulerAngles = rotation;
            }
        }


        switch (this.curRoadPoint!.moveType) {
            case fightConstants.ROAD_MOVE_TYPE.LINE:
                let offset = new Vec3();
                Vec3.subtract(offset, this.posTarget, this.node.worldPosition);
                offset.normalize();

                Vec3.multiplyScalar(offset, offset, this.currentSpeed * deltaTime * 60);
                let pos = this.node.worldPosition;
                offset.add(pos);

                if (this.posTarget.z !== this.posSrc.z) {
                    if (this.posTarget.z < this.posSrc.z) {
                        //向上
                        this.node.eulerAngles = new Vec3(0, 360, 0);

                        if (offset.z < this.posTarget.z) {
                            offset.z = this.posTarget.z;
                        }

                    } else {
                        //向下
                        this.node.eulerAngles = new Vec3(0, 180, 0);

                        if (offset.z > this.posTarget.z) {
                            offset.z = this.posTarget.z;
                        }
                    }
                } else {
                    if (this.posTarget.x > this.posSrc.x) {
                        //向上
                        this.node.eulerAngles = new Vec3(0, 270, 0);

                        if (offset.x > this.posTarget.x) {
                            offset.x = this.posTarget.x;
                        }
                    } else {
                        //向下
                        this.node.eulerAngles = new Vec3(0, 90, 0);

                        if (offset.x < this.posTarget.x) {
                            offset.x = this.posTarget.x;
                        }
                    }
                }

                // this.node.eulerAngles = offset;


                this.node.setWorldPosition(offset);

                break;
            case fightConstants.ROAD_MOVE_TYPE.BEND:
                //进行圆角计算
                let offsetRotation = this.targetRotation - this.originRotation;
                let curRotation = this.node.eulerAngles.y < 0 ? 360 + this.node.eulerAngles.y : this.node.eulerAngles.y;
                if (this.node.eulerAngles.y > 360) {
                    curRotation = this.node.eulerAngles.y - 360;
                }
                let percent = Math.abs((curRotation - this.originRotation) / offsetRotation);

                let nextRotation = offsetRotation * percent + (this.currentSpeed * deltaTime * 60 * this.quarter * (this.targetRotation > this.originRotation ? 1 : -1) );
                if (Math.abs(offsetRotation) < Math.abs(nextRotation)) {
                    nextRotation = offsetRotation;
                }

                let target = this.originRotation + nextRotation;


                let posCur = Vec3.rotateY(new Vec3(), this.posSrc, this.circleCenterPoint, nextRotation* Math.PI/180);

                this.node.setWorldPosition(posCur);
                this.node.eulerAngles = new Vec3(0, target, 0);
                break;
        }

        if (Vec3.subtract(new Vec3(), this.posTarget, this.node.worldPosition).lengthSqr() < 0.001) {
            //到达目标点
            this.arrivalPoint();
        }
    }

    public moveAfterFinished () {
        this.isMoving = true;
        this.minSpeed = 0.2;
        this.maxSpeed = 0.2;
        this.startRunning();
    }

    public tooting () {
        if (this.tootingCoolTime > 0) {
            return;
        }

        this.tootingCoolTime = TOOTING_COOL_TIME; //设置为最大时间

        //随机个音效播放
        let audio = Math.floor(Math.random() * 2) === 1 ? constant.AUDIO_SOUND.TOOTING1:constant.AUDIO_SOUND.TOOTING2;
        audioManager.instance.playSound(audio);
    }
}
