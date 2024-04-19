// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Prefab, Node, instantiate } from "cc";
import { localConfig } from "../../framework/localConfig";
import { shopItem } from "./shopItem";
const { ccclass, property } = _decorator;

const MAX_PAGE_SIZE = 9;    //一页最多9个

@ccclass("shopPage")
export class shopPage extends Component {
    @property(Prefab)
    pfShopItem: Prefab = null!;

    page: number = 0;

    // objShopItems: any = {};

    start () {
        // Your initialization goes here.
    }

    setPage (iPage: number) {
        this.page = iPage;
    }

    show () {
        let arrCars = localConfig.instance.getCars();

        let start = this.page * MAX_PAGE_SIZE;
        let end = (this.page + 1) * MAX_PAGE_SIZE;

        let idxCnt = 0;
        for (let idx = start; idx < end; idx++,idxCnt++) {
            let item: Node = null!;
            if (idxCnt < this.node.children.length) {
                item = this.node.children[idxCnt];
            } else {
                item = instantiate(this.pfShopItem);
                item.parent = this.node
            }

            item.getComponent(shopItem)!.show(arrCars[idx]);
        }
    }

    unSelectAll () {
        this.node.children.forEach((nodeItem) =>{
            nodeItem.getComponent(shopItem)!.select = false;
        });
    }

    unUseAll () {
        this.node.children.forEach((nodeItem) =>{
            nodeItem.getComponent(shopItem)!.used = false;
        });
    }

    refreshUse (carId: number) {
        this.node.children.forEach((nodeItem) =>{
            let item = nodeItem.getComponent(shopItem)!;
            if (item.carInfo.ID === carId) {
                item.onItemClick();
            }
        });
    }
}
