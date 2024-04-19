// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Sprite, SpriteFrame, Label } from "cc";
import { localConfig } from "../../framework/localConfig";
import { audioManager } from "../../framework/audioManager";
import { configuration } from "../../framework/configuration";
import { uiManager } from "../../framework/uiManager";
import { gameLogic } from "../../logic/gameLogic";
import { constant } from "../../framework/constant";
import { i18n } from "../../i18nMaster/runtime-scripts/LanguageData";
const { ccclass, property } = _decorator;

@ccclass("setting")
export class setting extends Component {
    /* class member could be defined like this */
    // dummy = '';

    @property(Sprite)
    spVibrateSwitch: Sprite = null;

    @property(Sprite)
    spSoundSwitch: Sprite = null;

    @property(SpriteFrame)
    imgSwitchOpen: SpriteFrame = null;

    @property(SpriteFrame)
    imgSwitchClose: SpriteFrame = null;

    @property(Label)
    lbVersion: Label = null;
    isSoundOpen: boolean;
    isVibrateOpen: boolean;

    clickTimes = 0;//展示次数

    static checkState(){
        const data = audioManager.instance.getConfiguration(true);
        if (!data) {
            audioManager.instance.closeMusic();
            audioManager.instance.closeSound();
        } else {
            audioManager.instance.openMusic();
            audioManager.instance.openSound();
        }
    }

    start () {
        // Your initialization goes here.
    }

    show () {
        this.clickTimes += 1;

        this.lbVersion.string = `${i18n.t("setting.version")} ${localConfig.instance.getVersion()}`;

        this.isSoundOpen = audioManager.instance.getConfiguration(true);
        this.isVibrateOpen = gameLogic.isVibrateOpen();

        this.refreshSwitchUI();
    }

    refreshSwitchUI () {
        if (this.isVibrateOpen) {
            this.spVibrateSwitch.spriteFrame = this.imgSwitchOpen;
        } else {
            this.spVibrateSwitch.spriteFrame = this.imgSwitchClose;
        }

        if (this.isSoundOpen) {
            this.spSoundSwitch.spriteFrame = this.imgSwitchOpen;
        } else {
            this.spSoundSwitch.spriteFrame = this.imgSwitchClose;
        }
    }

    onBtnVibrateClick () {
        // this.isVibrateOpen = !this.isVibrateOpen;
        // configuration.instance.setGlobalData('vibrate', this.isVibrateOpen);
        // this.refreshSwitchUI();
    }

    onBtnSoundClick () {
        this.isSoundOpen = !this.isSoundOpen;

        if (!this.isSoundOpen) {
            audioManager.instance.closeMusic();
            audioManager.instance.closeSound();
        } else {
            audioManager.instance.openMusic();
            audioManager.instance.openSound();
        }
        configuration.instance.setGlobalData('music', `${this.isSoundOpen}`);
        this.refreshSwitchUI();
    }

    onBtnCloseClick () {
        uiManager.instance.hideDialog('main/setting');
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
