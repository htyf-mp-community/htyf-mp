// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Label, Button, Node, Prefab, Vec3, Color, Sprite, instantiate } from "cc";
import { playerData } from "../../framework/playerData";
import { clientEvent } from "../../framework/clientEvent";
import { util } from "../../framework/util";
import { uiManager } from "../../framework/uiManager";
import { shopPage } from "./shopPage";
import { poolManager } from "../../framework/poolManager";
import { localConfig } from "../../framework/localConfig";
import { resourceUtil } from "../../framework/resourceUtil";
import { constant } from "../../framework/constant";
import { gameLogic } from "../../logic/gameLogic";
import { i18n } from "../../i18nMaster/runtime-scripts/LanguageData";

const { ccclass, property } = _decorator;

const MAX_PAGE_SIZE = 9;    //一页最多9个

@ccclass("shop")
export class shop extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property(Label)
    lbGold: Label = null!;

    @property(Node)
    nodeGet: Node = null!;

    @property(Node)
    nodeGold: Node = null!;

    @property(Node)
    nodeBuy: Node = null!;

    @property(Node)
    nodeGo: Node = null!;

    @property(Label)
    lbDesc: Label = null!;

    @property(Label)
    lbPrice: Label = null!;

    @property(Label)
    lbGo: Label = null!;

    @property(Node)
    nodeCarParent: Node = null!;

    @property(Node)
    nodePages: Node = null!;

    @property(Prefab)
    pfPage: Prefab = null!;

    @property(Sprite)
    spCarBlack: Sprite = null!;

    @property(Label)
    lbPage: Label = null!;

    //TODO 由于3D编辑器目前还不支持pageView控件，所以现在只有单页
    currentPage: Node | null = null;
    currentCar: Node | null = null;
    carDegree = 0;
    rotateSpeed = 30;
    currentCarInfo: any;
    pageIndex = 0;
    maxPage = 0;
    currentCarID = 0;

    start () {
        // Your initialization goes here.
    }

    onEnable () {
        clientEvent.on('updateGold', this.updateGold, this);
        clientEvent.on('onShopItemSelect', this.onShopItemSelect, this);
        clientEvent.on('updateBuyTask', this.updateButtons, this);
    }

    onDisable () {
        clientEvent.off('updateGold', this.updateGold, this);
        clientEvent.off('onShopItemSelect', this.onShopItemSelect, this);
        clientEvent.off('updateBuyTask', this.updateButtons, this);
    }

    show () {
        let cars = localConfig.instance.getCars();
        this.maxPage = Math.floor(cars.length / MAX_PAGE_SIZE);

        this.updateGold();

        this.showPage();
    }

    showPage () {
        if (!this.currentPage) {
            this.currentPage = instantiate(this.pfPage);
            this.currentPage.parent = this.nodePages;
            this.pageIndex = 0;
            this.refreshPageLabel();
            this.currentPage.getComponent(shopPage)!.setPage(this.pageIndex);
        }

        this.currentPage.getComponent(shopPage)!.show();
    }

    updateGold () {
        let gold = playerData.instance.playerInfo.gold || 0;
        this.lbGold.string = util.formatMoney(gold);
    }

    onBtnCloseClick () {
        uiManager.instance.hideDialog('shop/shop');
    }

    getCar () {
        // playerData.instance.buyCar(this.currentCarInfo.ID);
        gameLogic.buyCar(this.currentCarInfo.ID);

        let rewardInfo = {
            rewardType: constant.REWARD_TYPE.CAR,
            amount: 1,
            ID: this.currentCarInfo.ID
        };
        uiManager.instance.showDialog('common/showReward', [rewardInfo, false, /*i18n.t("showReward.buySuccessful")*/'购买成功', ()=>{
            //启用
            gameLogic.useCar(this.currentCarInfo.ID);

            this.currentPage!.getComponent(shopPage)!.refreshUse(this.currentCarInfo.ID);
        }, null, /*i18n.t("showReward.confirm")*/'确认']);
    }

    onBtnGetClick () {
        let carID = this.currentCarInfo.ID;
        if (playerData.instance.hasCar(carID)) {
            // 点击换车按钮后才算换车成功
            playerData.instance.useCar(carID);
            clientEvent.dispatchEvent('updateCar');
            // return;
        } else if (this.currentCarInfo.type === constant.BUY_CAR_TYPE.GOLD) {
            if (this.currentCarInfo.num > playerData.instance.playerInfo.gold) {
                //金币不足
                // return;

                uiManager.instance.showTips(/*i18n.t("shop.getGold")*/'获取金币', ()=>{});
                return;
            }

            //扣款
            gameLogic.addGold(-this.currentCarInfo.num);

            //获得车
            this.getCar();
        } else {
            let currentProgress = playerData.instance.getBuyTypeProgress(this.currentCarInfo.type);

            if (currentProgress >= this.currentCarInfo.num) {
                //可以获得了
                this.getCar();
            } else {
                //对应任务，对应界面
                switch (this.currentCarInfo.type) {
                    case constant.BUY_CAR_TYPE.GAME:
                    case constant.BUY_CAR_TYPE.LOGIN:
                    case constant.BUY_CAR_TYPE.CONTINUOUS_LOGIN:
                    case constant.BUY_CAR_TYPE.PASS_LEVEL:
                        this.onBtnCloseClick();
                        break;
                    case constant.BUY_CAR_TYPE.SIGNIN:
                        this.onBtnCloseClick();
                        //显示签到界面
                        uiManager.instance.showDialog('signIn/signIn');
                        break;
                    case constant.BUY_CAR_TYPE.SHARE:
                        gameLogic.openReward(constant.SHARE_FUNCTION.SHOP_SHARE, (err, type)=>{

                        });
                        break;
                    case constant.BUY_CAR_TYPE.VIDEO:
                        gameLogic.openReward(constant.SHARE_FUNCTION.SHOP_VIDEO, (err, isOver)=>{

                        });
                        break;
                }
            }
        }
    }

    checkBtn () {

    }

    onBtnGoldClick () {
        gameLogic.openReward(constant.SHARE_FUNCTION.SHOP_VIDEO, (err)=>{
            if (!err) {
                gameLogic.showFlyReward(constant.REWARD_TYPE.GOLD, ()=>{
                    gameLogic.addGold(300);
                    this.updateButtons();
                });
            }
        });
    }

    onShopItemSelect (carID: number, useCar: boolean) {
        let curPage = this.currentPage!.getComponent(shopPage)!;
        curPage.unSelectAll();

        if (useCar) {
            curPage.unUseAll();
        }

        if (this.currentCar) {
            poolManager.instance.putNode(this.currentCar);
            this.currentCar = null;
        }

        //刷新界面展示
        this.currentCarInfo = localConfig.instance.queryByID('car', carID.toString());

        if (this.currentCarInfo.type === constant.BUY_CAR_TYPE.SHARE) {
            //分享审核的时候特殊处理
            this.currentCarInfo.type = constant.BUY_CAR_TYPE.GOLD;
            this.currentCarInfo.num = 2000;
        }

        if (playerData.instance.hasCar(carID)) {
            this.spCarBlack.node.active = false;
            resourceUtil.getUICar(this.currentCarInfo.model, (err, prefab)=>{
                if (err) {
                    console.error(err, this.currentCarInfo.model);
                    return;
                }

                this.carDegree = 0;
                this.currentCar = poolManager.instance.getNode(prefab, this.nodeCarParent);
            });
        } else {
            this.spCarBlack.node.active = true;
            resourceUtil.setCarIcon(this.currentCarInfo.model, this.spCarBlack, true, ()=>{

            });
        }

        this.updateButtons();
    }

    update (deltaTime: number) {
        // Your update function goes here.
        //旋转展示车辆
        if (this.currentCar) {
            this.carDegree -= deltaTime * this.rotateSpeed;

            if (this.carDegree <= -360) {
                this.carDegree += 360;
            }

            this.currentCar.eulerAngles = new Vec3(0, this.carDegree, 0);
        }
    }

    updateButtons () {
        if (playerData.instance.hasCar(this.currentCarInfo.ID)) {
            //已拥有该车辆
            this.lbDesc.string = '';
            this.nodeGo.active = true;
            this.nodeBuy.active = false;

            this.lbGo.string = /*i18n.t('shop.acquired')*/'换车';

            //TODO 引擎点击事件传递有问题，先开起来
            this.nodeGet.getComponent(Button)!.interactable = true;

            //即刻玩那边特殊处理，如果是分享则变成用金币获取
        } else if (this.currentCarInfo.type === constant.BUY_CAR_TYPE.GOLD) {

            this.lbDesc.string = '';
            this.lbPrice.string = this.currentCarInfo.num;

            if (playerData.instance.playerInfo.gold >= this.currentCarInfo.num) {
                this.lbPrice.color = Color.WHITE;
                this.nodeGet.getComponent(Button)!.interactable = true;
                // this.nodeGold.active = false;

            } else {
                this.lbPrice.color = Color.RED;
                this.nodeGet.getComponent(Button)!.interactable = true;

                // this.nodeGold.active = true;
            }

            this.nodeGo.active = false;
            this.nodeBuy.active = true;

        } else {
            this.nodeGet.getComponent(Button)!.interactable = true;
            this.nodeGo.active = true;
            this.nodeBuy.active = false;

            let num = playerData.instance.getBuyTypeProgress(this.currentCarInfo.type);

            if (num < this.currentCarInfo.num) {
                this.lbGo.string = /*i18n.t('shop.go')*/'前往商店';
            } else {
                this.lbGo.string = /*i18n.t('shop.receive')*/'获取';
            }

            let strDesc = i18n.t(`carTask.${this.currentCarInfo.show}`);
            if (this.currentCarInfo.type !== constant.BUY_CAR_TYPE.SIGNIN) {
                strDesc += `(${i18n.t("shop.current")}：${num}/${this.currentCarInfo.num})`;
            }

            this.lbDesc.string = strDesc;
        }
    }

    refreshPageLabel () {
        this.lbPage.string = `${(this.pageIndex + 1)}/${this.maxPage + 1}`;
    }

    onBtnLeftClick () {
        const shopPageScript = this.currentPage!.getComponent(shopPage)!;
        if (this.pageIndex > 0) {
            this.pageIndex-- ;
        } else {
            this.pageIndex = this.maxPage;
        }

        this.refreshPageLabel();
        shopPageScript.setPage(this.pageIndex);
        shopPageScript.show();
    }

    onBtnRightClick () {
        const shopPageScript = this.currentPage!.getComponent(shopPage)!;
        if (this.pageIndex >= this.maxPage) {
            this.pageIndex = 0;
        } else {
            this.pageIndex++ ;
        }

        this.refreshPageLabel();
        shopPageScript.setPage(this.pageIndex);
        shopPageScript.show();
    }
}
