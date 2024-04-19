// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Label, Sprite, ProgressBar } from "cc";
import { fightConstants } from "../../fight/fightConstants";
import { gameLogic } from "../../logic/gameLogic";
import { uiManager } from "../../framework/uiManager";
import { constant } from "../../framework/constant";
const { ccclass, property } = _decorator;

@ccclass("clickBox")
export class clickBox extends Component {
    /* class member could be defined like this */
    // dummy = '';

    @property(ProgressBar)
    progress: ProgressBar = null!;

    @property(Node)
    nodeReward: Node = null!;

    @property(Label)
    lbReward: Label = null!;

    @property(Node)
    nodeBox: Node = null!;

    @property(Node)
    nodeMenu: Node = null!;

    @property(Node)
    nodeClickBtn: Node = null!;

    @property(Sprite)
    spIcon: Sprite = null!;

    scheduleTime: number = 0;
    curProgress: number = 50;
    clickTimes: number = 15;
    curClick: number = 0;
    isOpenBox: boolean = false;
    rewardValue = 0;

    start () {
        // Your initialization goes here.
    }

    show () {
        this.scheduleTime = 0;
        this.curProgress = 50;
        this.clickTimes = 10 + Math.floor(Math.random() * 5); //10-15次随机次数
        this.curClick = 0;
        this.isOpenBox = false;

        this.nodeClickBtn.active = true;
        this.progress.node.active = true;
        this.nodeBox.active = true;
        this.nodeReward.active = false;
        this.nodeMenu.active = false;

        gameLogic.updateRewardIcon(constant.SHARE_FUNCTION.CLICK_BOX, this.spIcon);
    }

    onBtnBoxClick () {
        if (this.isOpenBox) {
            return;
        }

        this.curClick++;

        if (this.curClick > this.clickTimes) {
            //TODO 打开宝箱
            this.isOpenBox = true;

            //切换展示
            this.showReward();
        } else {
            this.curProgress += 20;

            this.curProgress = this.curProgress > 100 ?  100 : this.curProgress;
        }
    }

    showReward () {
        this.nodeClickBtn.active = false;
        this.progress.node.active = false;
        this.nodeBox.active = false;
        this.nodeReward.active = true;
        this.nodeMenu.active = true;

        this.lbReward.string = `+${fightConstants.CLICK_BOX_REWARD}`;


        this.rewardValue = fightConstants.CLICK_BOX_REWARD;
        //TODO 展示一倍或者三倍奖励
        // playerData.instance.updatePlayerInfo('gold', fightConstants.CLICK_BOX_REWARD);
    }

    update (deltaTime: number) {
        this.scheduleTime += deltaTime;
        if (this.scheduleTime >= 0.1) {
            //100ms减3%
            this.curProgress -= 3;
            this.curProgress = this.curProgress < 0 ? 0 : this.curProgress;
            this.scheduleTime = 0;
        }

        this.progress.progress = this.curProgress / 100;
    }

    onBtnNormalClick () {
        gameLogic.addGold(fightConstants.CLICK_BOX_REWARD);

        this.close();
    }

    onBtnDoubleClick () {
        gameLogic.openReward(constant.SHARE_FUNCTION.CLICK_BOX, (err)=>{
            if (!err) {
                gameLogic.addGold(fightConstants.CLICK_BOX_REWARD*2);

                this.close();
            }
        });


    }

    close () {
        uiManager.instance.hideDialog('fight/clickBox');
    }

}
