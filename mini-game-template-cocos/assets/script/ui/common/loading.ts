import { _decorator, Component, Label, Node, Vec3 } from "cc";
import { updateValueLabel } from "./updateValueLabel";
const { ccclass, property } = _decorator;

@ccclass("loading")
export class loading extends Component {
    @property(updateValueLabel)
    lbProgress: updateValueLabel = null!;

    @property(Label)
    lbTips: Label = null!;

    targetProgress = 0;
    oriPos = new Vec3();

    start () {
       this.show(0);
    }

    show (start?: number) {
        if (start) {
            this.targetProgress = start;
        } else {
            this.targetProgress = 0;
        }

        this.lbProgress.playUpdateValue(this.targetProgress, this.targetProgress, 0);
        this.lbProgress.isPlaying = false;
        this.lbTips.string = '';

        this.oriPos.set(this.lbProgress.node.position);
    }

    updateProgress(progress: number, tips?: string) {
        this.targetProgress = progress;

        let curProgress = Number(this.lbProgress.label.string); //当前进度

        this.lbProgress.playUpdateValue(curProgress, this.targetProgress, (this.targetProgress - curProgress) / 20);

        if (tips) {
            this.lbTips.string = tips;
        }

        if (this.oriPos) {
            this.lbProgress.node.setPosition(new Vec3(this.oriPos.x - 10, this.oriPos.y, this.oriPos.z));
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
