import { CCString } from 'cc';
import { Sprite, spriteAssembler, Component, _decorator, SpriteFrame} from 'cc';

const { ccclass, property } = _decorator;
@ccclass("SpriteFrameSet")
export default class SpriteFrameSet {
    name: string = 'SpriteFrameSet';

    @property
    language = '';

    @property({type: SpriteFrame})
    spriteFrame: SpriteFrame = null!;
}
