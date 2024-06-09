import React from "react";
import asyncStorage, { AsyncStorageStatic } from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type {MMKV} from 'react-native-mmkv'

export const minisdkRef =  React.createRef<any>();

let storage = asyncStorage;

if (Platform.OS !== 'web') {
  try {
    const MMKV_KEY = `app_${__APP_DEFINE_APPID__}_storage`;
    const Mmkv = require('react-native-mmkv').MMKV;
    const ReactNativeBlobUtil = require('react-native-blob-util').default
    const mmkvStorage = new Mmkv({
      id: MMKV_KEY,
      path: `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${MMKV_KEY}`,
      encryptionKey: `${MMKV_KEY}_encryptionKey`
    }) as MMKV;
    storage = {
      async getItem(key: string) {
        const res = mmkvStorage.getString(key)
        return res;
      },

      async setItem(key: string, data: string) {
        return mmkvStorage.set(key, data)
      },

      async removeItem(key: string) {
        return mmkvStorage.delete(key)
      },

      async clear(callback) {
        mmkvStorage.clearAll()
        callback?.();
      }
    } as AsyncStorageStatic
  } catch (error) {
    console.error('localStorage mmkv error: ', error)
  }
}

export const localStorage: AsyncStorageStatic = storage;
