import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { MMKV } from 'react-native-mmkv';
import ReactNativeBlobUtil from 'react-native-blob-util'
import appsSlice, { APP_APPID, APP_BUILD_TIME, APP_VERSION } from './slices/appsSlice';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const rootReducer = combineReducers({
  apps: appsSlice,
});
const MMKV_KEY = `app_${APP_APPID}_storage`;

const storage = new MMKV({
  id: MMKV_KEY,
  path: `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${MMKV_KEY}`,
  encryptionKey: `${MMKV_KEY}_encryptionKey`
})


const persistedReducer = persistReducer({
  key: `__APP_${APP_APPID}_${APP_VERSION}_${APP_BUILD_TIME}__`,
  // 持久化数据版本
  version: Number(`${APP_VERSION}`?.replace(/\./gi, '0')),
  // 需要持久化的 slice 名称
  whitelist: [
    'apps'
  ],
  storage: {
    async getItem(key: string) {
      const res = storage.getString(key)
      return res;
    },
  
    async setItem(key: string, data: string) {
      return storage.set(key, data)
    },
  
    async removeItem(key: string) {
      return storage.delete(key)
    },
  }, // 使用 AsyncStorage 作为持久化存储的仓库
}, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // 替换为持久化后的reducer
  middleware: getDefaultMiddleware => {
    const defaultMiddleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });
    return defaultMiddleware;
  },
});

export const persistor = persistStore(store);

// 从 store 中推断出 `RootState` 和 `AppDispatch` 的类型
export type RootState = ReturnType<typeof store.getState>;
// 推断出类型: {counter: CounterState}
export type AppDispatch = typeof store.dispatch;


export function StoreProvider(props: any) {
  return <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {
        () => {
          if (typeof props.children === 'function') {
            return props.children();
          }
          return props.children
        }
      }
    </PersistGate>
  </Provider>
}