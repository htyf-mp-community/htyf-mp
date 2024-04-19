import { _decorator, AudioClip, sys, AudioSource, assert, clamp01, warn } from "cc";
import { configuration } from "./configuration";
import { resourceUtil } from "./resourceUtil";
import { lodash } from "./lodash";

export class audioManager {
    private static _instance: audioManager;
    private static _audioSource?: AudioSource;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new audioManager();
        return this._instance;
    }

    soundVolume: number = 1;

    // init AudioManager in GameRoot.
    init (audioSource: AudioSource) {
        this.soundVolume = this.getConfiguration(false) ? 1 : 0;

        audioManager._audioSource = audioSource;
    }

      getConfiguration (isMusic: boolean) {
        let state;
        if (isMusic) {
            state = configuration.instance.getGlobalData('music');
        } else {
            state = configuration.instance.getGlobalData('sound');
        }

        // console.log('Config for [' + (isMusic ? 'Music' : 'Sound') + '] is ' + state);

        return state === undefined || state === 'true' ? true : false;
    }

    /**
     * 播放音乐
     * @param {String} name 音乐名称可通过constants.AUDIO_MUSIC 获取
     * @param {Boolean} loop 是否循环播放
     */
    playMusic (loop: boolean) {
        const audioSource = audioManager._audioSource!;
        assert(audioSource, 'AudioManager not inited!');

        audioSource.loop = loop;
        if (!audioSource.playing) {
            audioSource.play();
        }
    }

    /**
     * 播放音效
     * @param {String} name 音效名称可通过constants.AUDIO_SOUND 获取
     */
    playSound (name:string) {
        const audioSource = audioManager._audioSource!;
        assert(audioSource, 'AudioManager not inited!');

        //音效一般是多个的，不会只有一个
        let path = 'gamePackage/audio/sound/';
        // if (name !== 'click') {
        //     path = 'gamePackage/' + path; //微信特殊处理，除一开场的音乐，其余的放在子包里头
        // }

        resourceUtil.loadRes(path + name, AudioClip, (err, clip)=> {
            if (err) {
                warn('load audioClip failed: ', err);
                return;
            }

            // NOTE: the second parameter is volume scale.
            audioSource.playOneShot(clip, audioSource.volume ? this.soundVolume / audioSource.volume : 0);
        });

    }

    setMusicVolume (flag: number) {
        const audioSource = audioManager._audioSource!;
        assert(audioSource, 'AudioManager not inited!');

        flag = clamp01(flag);
        audioSource.volume = flag;
    }

    setSoundVolume (flag: number) {
        this.soundVolume = flag;
    }

    openMusic () {
        this.setMusicVolume(0.8);
        configuration.instance.setGlobalData('music', 'true');
    }

    closeMusic () {
        this.setMusicVolume(0);
        configuration.instance.setGlobalData('music', 'false');
    }

    openSound () {
        this.setSoundVolume(1);
        configuration.instance.setGlobalData('sound', 'true');
    }

    closeSound () {
        this.setSoundVolume(0);
        configuration.instance.setGlobalData('sound', 'false');
    }
}
