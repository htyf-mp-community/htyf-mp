import { _decorator, Component, Widget, Sprite, Node} from "cc";
import { gameLogic } from "../../logic/gameLogic";
import { constant } from "../../framework/constant";
import { poolManager } from "../../framework/poolManager";
import { localConfig } from "../../framework/localConfig";
import { playerData } from "../../framework/playerData";
import { resourceUtil } from "../../framework/resourceUtil";
import { uiManager } from "../../framework/uiManager";
import { clientEvent } from "../../framework/clientEvent";

const { ccclass, property } = _decorator;

@ccclass("invincible")
export class invincible extends Component {
    /* class member could be defined like this */
    // dummy = '';

    @property(Node)
    nodeCarParent: Node = null!;

    @property(Widget)
    wgMenu: Widget = null!;

    @property(Sprite)
    spIcon: Sprite = null!;

    _callback: Function | undefined = undefined;
    currentCar: Node | null = null;

    start () {
        // Your initialization goes here.
    }

    show (callback: Function) {
        // 防止因操作卡顿造成重复展示
        if(this._callback){
            return;
        }

        this._callback = callback;

        gameLogic.updateRewardIcon(constant.SHARE_FUNCTION.INVINCIBLE, this.spIcon, (err, type)=>{

        });

        if (this.currentCar) {
            poolManager.instance.putNode(this.currentCar);
            this.currentCar = null;
        }

        //随机辆未拥有的车
        let carInfo = localConfig.instance.queryByID('car', playerData.instance.showCar.toString());

        resourceUtil.getUICar(carInfo.model, (err, prefab)=>{
            if (err) {
                console.error(err, carInfo.model);
                return;
            }

            this.currentCar = poolManager.instance.getNode(prefab, this.nodeCarParent);
        });
    }

    onBtnCloseClick () {
        uiManager.instance.hideDialog('main/invincible');
        this._callback && this._callback();
        this._callback = undefined;
    }

    onBtnOKClick () {
        gameLogic.openReward(constant.SHARE_FUNCTION.INVINCIBLE, (err, type)=>{
            if (err)
                return;

            clientEvent.dispatchEvent('showInvincible');

            this.onBtnCloseClick();
        });
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
