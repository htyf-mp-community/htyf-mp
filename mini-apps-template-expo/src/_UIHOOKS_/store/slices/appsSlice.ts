import {createSlice, PayloadAction} from '@reduxjs/toolkit';


export const APP_APPID = __APP_DEFINE_APPID__;
export const APP_VERSION = __APP_DEFINE_VERSION__;
export const APP_BUILD_TIME = __APP_DEFINE_BUILD_TIME__;

enum ENV_ENUM {
  'MASTER',
  'QA',
  'DEV'
}

enum HOST_ENUM {
  'https://mini.xx.com/api',
  'https://mini.xxx.com/api',
}


// 初始状态类型
export interface AppsState {
  __ENV__: keyof typeof ENV_ENUM;
  __APPID__: string;
  __VERSION__: string;
  __BUILD_TIME__: string;
  __HOST__: keyof typeof HOST_ENUM;
  token: string;
  device: {
    videoinput: undefined | string;
    audioinput: undefined | string;
  }
}

// 定义一个初始状态
const initialState: AppsState = {
  __ENV__: `MASTER`,
  __APPID__: `${APP_APPID}`,
  __VERSION__: `${APP_VERSION}`,
  __BUILD_TIME__: `${APP_BUILD_TIME}`,
  __HOST__: 'https://mini.xx.com/api',
  token: '',
} as AppsState;

const counterSlice = createSlice({
  name: '__AppGlobal__',
  initialState,
  reducers: {
    setEnv: (state, action: PayloadAction<AppsState['__ENV__']>) => {
      if (ENV_ENUM[action.payload]) {
        state.__ENV__ = action.payload;
      } else {
        state.__ENV__ = 'MASTER';
      }
      
      if (state.__ENV__ === 'DEV') {
        state.__HOST__ = 'https://mini.xx.com/api';
      } else if (state.__ENV__ === 'QA') {
        state.__HOST__ = 'https://mini.xx.com/api';
      } else {
        state.__HOST__ = 'https://mini.xx.com/api';
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.token = '';
    },
    setDevice: (state, action: PayloadAction<AppsState['device']>) => {
      state.device = action.payload;
    }
  },
});
// 每个 case reducer 函数会生成对应的 Action creators
export const {setEnv, setToken, setDevice, logout} = counterSlice.actions;

export default counterSlice.reducer;
