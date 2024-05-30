// const Polyglot = require('polyglot.min');

import { director } from 'cc';
import { Polyglot } from './polyglot.min';

declare global {
    namespace globalThis {
        var i18nConfig: any;
    }
}

let polyInst: Polyglot;
if (!window.i18nConfig) {
    window.i18nConfig = {
        languages: {},
        curLang:''
    };
}

// if (CC_EDITOR) {
//     Editor.Profile.load('profile://project/i18n.json', (err, profile) => {
//         window.i18nConfig.curLang = profile.data['default_language'];
//         if (polyInst) {
//             let data = loadLanguageData(window.i18nConfig.curLang) || {};
//             initPolyglot(data);
//         }
//     });
// }

function loadLanguageData (language: string) {
    //@ts-ignore
    return window.i18nConfig.languages[language];
}

function initPolyglot (data: any) {
    if (data) {
        if (polyInst) {
            polyInst.replace(data);
        } else {
            polyInst = new Polyglot({ phrases: data, allowMissing: true });
        }
    }
}

// module.exports = {
export class i18n {
    static inst: any = null;

    /**
     * This method allow you to switch language during runtime, language argument should be the same as your data file name
     * such as when language is 'zh', it will load your 'zh.js' data source.
     * @method init
     * @param language - the language specific data file name, such as 'zh' to load 'zh.js'
     */
    static init (language?: string) {
        if (!language || language === window.i18nConfig.curLang) {
            return;
        }
        let data = loadLanguageData(language) || {};
        window.i18nConfig.curLang = language;
        initPolyglot(data);
        this.inst = polyInst;
    }
    /**
     * this method takes a text key as input, and return the localized string
     * Please read https://github.com/airbnb/polyglot.js for details
     * @method t
     * @return {String} localized string
     * @example
     *
     * var myText = i18n.t('MY_TEXT_KEY');
     *
     * // if your data source is defined as
     * // {"hello_name": "Hello, %{name}"}
     * // you can use the following to interpolate the text
     * var greetingText = i18n.t('hello_name', {name: 'nantas'}); // Hello, nantas
     */
    static t (key: any, opt ?: object) {
        if (Object.keys(polyInst.phrases).length === 0) {
            let data = loadLanguageData(window.i18nConfig.curLang) || {};
            initPolyglot(data);
            console.warn('###防止出现parses数据丢失，重新替换数据');
        }
        if (polyInst) {
            return polyInst.t(key, opt);
        }
    }

    // inst: polyInst

    updateSceneRenderers () { // very costly iterations
        let rootNodes = director.getScene()!.children;
        // walk all nodes with localize label and update
        let allLocalizedLabels: any[] = [];
        for (let i = 0; i < rootNodes.length; ++i) {
            let labels = rootNodes[i].getComponentsInChildren('LocalizedLabel');
            Array.prototype.push.apply(allLocalizedLabels, labels);
        }
        for (let i = 0; i < allLocalizedLabels.length; ++i) {
            let label = allLocalizedLabels[i];
            if(!label.node.active)continue;
            label.updateLabel();
        }
        // walk all nodes with localize sprite and update
        let allLocalizedSprites: any[] = [];
        for (let i = 0; i < rootNodes.length; ++i) {
            let sprites = rootNodes[i].getComponentsInChildren('LocalizedSprite');
            Array.prototype.push.apply(allLocalizedSprites, sprites);
        }
        for (let i = 0; i < allLocalizedSprites.length; ++i) {
            let sprite = allLocalizedSprites[i];
            if(!sprite.node.active)continue;
            sprite.updateSprite(window.i18nConfig.curLang);
        }
    }
};
