// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Animation, Vec3, isValid } from "cc";
import { clientEvent } from "../framework/clientEvent";
import { fightConstants } from "./fightConstants";
import { audioManager } from "../framework/audioManager";
import { constant } from "../framework/constant";
import { resourceUtil } from "../framework/resourceUtil";
import { poolManager } from "../framework/poolManager";
const { ccclass, property } = _decorator;

@ccclass("customerManager")
export class customerManager extends Component {
    @property
    moveSpeed: number = 1;

    nodeCustomer: Node | null = null;
    _targetPos: Vec3 | null = null;
    _callback: (() => void) | undefined = undefined;
    _offset: Vec3 | null = null;
    customerId: number = -1;
    retryTimes: number = 0;

    start() {
        // Your initialization goes here.
    }


    /**
     * 触发新订单
     *
     * @memberof customerManager
     */
    newOrder() {
        //随机个乘客给他
        this.customerId = Math.floor(Math.random() * constant.CUSTOMER_MAX_CNT) + 1;

        clientEvent.dispatchEvent('showTalk', this.customerId, fightConstants.CUSTOMER_TALK_TIME.NEW_ORDER);
    }

    /**
     * 接客
     * @param {Vec3} carWorldPos 车辆当前位置
     * @param direction 乘客的方向
     * @param callback 乘客上车后的回调函数
     */
    greeting(carWorldPos: Vec3, direction: Vec3, callback: () => void) {
        if (this.customerId === -1) {
            //还没有产生过乘客
            //随机个乘客给他
            this.customerId = Math.floor(Math.random() * constant.CUSTOMER_MAX_CNT) + 1;
        }

        //使用订单时产生的乘客
        if (this.nodeCustomer) {
            poolManager.instance.putNode(this.nodeCustomer);
            this.nodeCustomer = null;
        }

        resourceUtil.getCustomer(this.customerId.toString(), (err, prefab) => {
            if (err) {
                console.error(err);
                //尝试重新加载一次
                if (this.retryTimes < 3) {
                    this.greeting(carWorldPos, direction, callback);
                }
                return;
            }

            this.retryTimes = 0;


            this.nodeCustomer = poolManager.instance.getNode(prefab, this.node);
            this.nodeCustomer.active = true;

            // direction = new Vec3(direction.x, direction.y, direction.z);

            let tmpVec3 = new Vec3();
            Vec3.multiplyScalar(tmpVec3, direction, 1.3);
            Vec3.add(tmpVec3, carWorldPos, tmpVec3);
            let customerPos = tmpVec3.clone();

            Vec3.multiplyScalar(tmpVec3, direction, 0.25);
            Vec3.add(tmpVec3, carWorldPos, tmpVec3);
            let targetPos = tmpVec3.clone();

            this.nodeCustomer.setWorldPosition(customerPos);

            if (direction.x !== 0) {
                if (direction.x > 0) {
                    this.nodeCustomer.eulerAngles = new Vec3(0, 270, 0);
                } else {
                    this.nodeCustomer.eulerAngles = new Vec3(0, 90, 0);
                }
            } else {
                if (direction.z > 0) {
                    this.nodeCustomer.eulerAngles = new Vec3(0, 180, 0);
                } else {
                    this.nodeCustomer.eulerAngles = new Vec3(0, 0, 0);
                }
            }

            audioManager.instance.playSound(constant.AUDIO_SOUND.NEW_ORDER);

            this.customerMove(targetPos, () => {
                audioManager.instance.playSound(constant.AUDIO_SOUND.IN_CAR);

                //接完客后
                callback && callback();

                //触发乘客问候
                this.scheduleOnce(() => {
                    clientEvent.dispatchEvent('showTalk', this.customerId, fightConstants.CUSTOMER_TALK_TIME.INTO_THE_CAR);
                }, 1);

            });
        });


    }

    /**
     * 送客
     * @param carWorldPos 车辆当前位置
     * @param direction 乘客前往的方向
     * @param isLastCustomer 是否最后一位乘客
     * @param callback 乘客上车后的回调函数
     */
    takeCustomer(carWorldPos: Vec3, direction: Vec3, isLastCustomer: boolean, callback?: () => void) {
        if (!this.nodeCustomer) {
            //没有顾客可能有异常直接过
            if(callback){
                callback();
            }

            return;
        }

        direction = new Vec3(direction.x, direction.y, direction.z);

        let tmpVec3 = new Vec3();
        Vec3.multiplyScalar(tmpVec3, direction, 0.25);
        Vec3.add(tmpVec3, carWorldPos, tmpVec3);
        let posCur = tmpVec3.clone();

        this.nodeCustomer.active = true;
        this.nodeCustomer.setWorldPosition(posCur);
        if (direction.x !== 0) {
            if (direction.x > 0) {
                this.nodeCustomer.eulerAngles = new Vec3(0, 90, 0);
            } else {
                this.nodeCustomer.eulerAngles = new Vec3(0, 270, 0);
            }
        } else {
            if (direction.z > 0) {
                this.nodeCustomer.eulerAngles = new Vec3(0, 0, 0);
            } else {
                this.nodeCustomer.eulerAngles = new Vec3(0, 180, 0);
            }
        }

        Vec3.multiplyScalar(tmpVec3, direction, 1.3);
        Vec3.add(tmpVec3, carWorldPos, tmpVec3);
        let targetPos = tmpVec3.clone();

        audioManager.instance.playSound(constant.AUDIO_SOUND.GET_MONEY);

        this.customerMove(targetPos, () => {
            //送完客后
            if (callback){
                callback()
            }

            //2秒后触发新订单
            //需要检测是否已经结束
            if (!isLastCustomer) {
                //触发新订单
                this.scheduleOnce(() => {
                    this.newOrder();
                }, 2);
            }
        });
    }

    customerMove(targetPos: Vec3, callback:() => void) {
        this._targetPos = targetPos;
        this._callback = callback;

        let ani = this.nodeCustomer!.getComponent(Animation)!;
        ani.play('walk');

        this._offset = Vec3.subtract(new Vec3(), this._targetPos, this.nodeCustomer!.worldPosition);
        this._offset.multiplyScalar(this.moveSpeed);
    }

    update(deltaTime: number) {
        // Your update function goes here.

        if (this._targetPos && this.nodeCustomer) {
            let posWorld = this.nodeCustomer.getWorldPosition();
            let offset = new Vec3();
            Vec3.multiplyScalar(offset, this._offset!, deltaTime);
            posWorld.add(offset);

            if (Vec3.subtract(offset, posWorld, this._targetPos).lengthSqr() < 0.01) {
                //到达目标
                this.onMoveOver();
            } else {
                this.nodeCustomer.setWorldPosition(posWorld);
            }
        }
    }

    onMoveOver() {
        this.nodeCustomer!.setWorldPosition(this._targetPos!);
        this.nodeCustomer!.active = false;
        this._targetPos = null;
        this._callback && this._callback();
    }

    reset() {
        if (this.nodeCustomer && isValid(this.nodeCustomer)) {
            let ani = this.nodeCustomer.getComponent(Animation)!;
            // ani.stop();
            ani.getState('walk').stop();
            this.nodeCustomer.destroy();
            this.nodeCustomer = null;
        }

        this.customerId = -1;
    }
}
