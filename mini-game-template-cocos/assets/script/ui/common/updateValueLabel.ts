import { _decorator, Label, Component } from "cc";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("updateValueLabel")
@requireComponent(Label)
export class updateValueLabel extends Component {
    isPlaying: boolean = false;
    startVal = 0;
    endVal = 0;
    diffVal = 0;
    currTime = 0;
    changingTime = 0;
    label: Label = null!;

    start () {
        // Your initialization goes here.

    }

    playUpdateValue(startVal: number, endVal: number, changingTime: number) {
        this.startVal = startVal;
        this.endVal = endVal;

        this.diffVal = this.endVal - this.startVal;

        this.currTime = 0;
        this.changingTime = changingTime;

        this.label = this.node.getComponent(Label)!;
        this.label.string = startVal.toString();

        this.isPlaying = true;
    }

    update(dt: number) {
        if(!this.isPlaying) {
            return;
        }

        if(this.currTime < this.changingTime) {
            this.currTime += dt;

            var currVal = this.startVal + parseInt((this.currTime / this.changingTime * this.diffVal).toString());
            if (currVal < this.startVal) {
                currVal = this.startVal;
            } else if (currVal > this.endVal) {
                currVal = this.endVal;
            }

            this.label.string = `${currVal}`;
            return;
        }

        this.label.string = `${this.endVal}`;
        this.isPlaying = false;

    }

    // update (deltaTime) {
    //     // Your update function goes here.
    // }
}
