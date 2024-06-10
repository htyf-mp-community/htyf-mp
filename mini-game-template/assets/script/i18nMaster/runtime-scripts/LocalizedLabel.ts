import { _decorator, Component, Node, view, Label, CCString, log, error} from "cc";
import { EDITOR } from "cc/env";
import { i18n } from './LanguageData';

const { ccclass, property } = _decorator;
@ccclass("LocalizedLabel")
export default class LocalizedLabel extends Component {

    _debouncedUpdateLabel: any = null;
    label: Label | null = null;

    static editor = {
        executeInEditMode: true,
        menu: 'i18n/LocalizedLabel'
    }

    @property
    _dataID = "";

    @property
    set dataID (val: string) {
        if (this._dataID !== val) {
            this._dataID = val;

            if (EDITOR) {
                this._debouncedUpdateLabel && this._debouncedUpdateLabel();
            } else {
                this.updateLabel();
            }
        }
    }

    get dataID() {
        return this._dataID;
    }

    onLoad () {
        if(EDITOR) {
            this._debouncedUpdateLabel = this.debounce(this.updateLabel, 200);
        }
        if (!i18n.inst) {
            i18n.init();
        }
        log('dataID: ' + this.dataID + ' value: ' + i18n.t(this.dataID));
        this.fetchRender();
    }

    fetchRender () {
        let label = this.getComponent(Label);
        if (label) {

            this.label = label;

            this.updateLabel();
            return;
        }
    }

    updateLabel () {
        if (!this.label) {
            error('Failed to update localized label, label component is invalid!');
            return;
        }
        let localizedString = i18n.t(this.dataID, {});
        if (localizedString) {
            this.label.string = i18n.t(this.dataID, {});
        }
    }

    debounce(func: Function, wait: number, immediate ?: number) {
        let timeout = -1;
        return (() => {
            const args = arguments;
            const later = (() => {
                timeout = -1;
                if (!immediate) func.apply(this, args);
            }).bind(this);
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        }).bind(this);
    }
}
