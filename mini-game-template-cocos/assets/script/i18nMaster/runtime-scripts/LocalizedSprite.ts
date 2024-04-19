import { _decorator, Component, Node, view, Sprite, error } from "cc";
import SpriteFrameSet from "./SpriteFrameSet";

const { ccclass, property } = _decorator;

@ccclass("LocalizedSprite")
export default class LocalizedSprite extends Component{

    sprite: Sprite | null = null;

    static editor = {
        executeInEditMode: true,
        inspector: 'packages://i18n/inspector/localized-sprite.js',
        menu: 'i18n/LocalizedSprite'
    }

    @property({type: [SpriteFrameSet], displayOrder: 1})
    spriteFrameSet: SpriteFrameSet[] = [];

    onLoad () {
        this.fetchRender();
    }

    fetchRender () {
        let sprite = this.getComponent(Sprite);
        if (sprite) {
            this.sprite = sprite;
            this.updateSprite(window.i18nConfig.curLang);
            return;
        }
    }

    getSpriteFrameByLang (lang: string) {
        for (let i = 0; i < this.spriteFrameSet.length; ++i) {
            if (this.spriteFrameSet[i].language === lang) {
                return this.spriteFrameSet[i].spriteFrame;
            }
        }
    }

    updateSprite (language: string) {
        if (!this.sprite) {
            error('Failed to update localized sprite, sprite component is invalid!');
            return;
        }

        let spriteFrame = this.getSpriteFrameByLang(language);

        if (!spriteFrame && this.spriteFrameSet[0]) {
            spriteFrame = this.spriteFrameSet[0].spriteFrame;
        }

        if (spriteFrame) {
            this.sprite.spriteFrame = spriteFrame;
        }
    }
}


