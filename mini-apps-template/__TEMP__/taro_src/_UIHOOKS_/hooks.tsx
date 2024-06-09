import React, { ReactNode } from 'react';
import { getEnv } from '@tarojs/taro';
import { useImmer } from 'use-immer'
import Modal, { ModalProps } from './components/Modal';
import { useAppSelector } from '@/_UIHOOKS_';
import { View, Text } from '@tarojs/components';
import './index.scss'
import Toast, { ToastProps } from './components/Toast';


const isDev = process.env.NODE_ENV !== 'production';

export const UIContext = React.createContext<any>(null);

if (isDev) {
  UIContext.displayName = '__DGZ_UIContext___';
}

export interface UIProviderProps {
  children: ReactNode | Function;
}

export const UIProvider = (props: UIProviderProps) => {
  const [showModalOpt, setShowModalOpt] = useImmer<ModalProps | undefined>(undefined);
  const [showToastOpt, setShowToastOpt] = useImmer<ToastProps | undefined>(undefined);
  const { __ENV__ } = useAppSelector(state => state.apps);
  return <UIContext.Provider
    value={{
      showModal: (opt: Omit<ModalProps, 'open'>) => {
        setShowModalOpt({
          ...opt,
          open: true,
        })
      },
      showToast: (opt: Omit<ToastProps, 'open'>) => {
        setShowToastOpt({
          ...opt,
          open: true,
        })
      },
      hideToast: () => {
        setShowToastOpt(undefined);
      }
    } as SDKType}
  >
    {
      __ENV__ !== 'MASTER' ? <View
        className='uihooks-env-type-class-wrap'
        pointerEvents="none"
        // @ts-ignore
        style={getEnv() === 'RN' ? {
          transform: [{ rotate: '45deg' }]
        } : {}}>
        <View style={{ height: 15, width: 15 }} />
        <Text style={{ fontSize: 10, color: '#fff' }}>{__ENV__}</Text>
      </View> : undefined
    }
    {
      typeof props.children === 'function' ? props.children() : props?.children
    }
    {
      showModalOpt ? <Modal
        {...showModalOpt}
        onOk={() => {
          setShowModalOpt(undefined);
          showModalOpt.onOk?.()
        }}
        onCancel={() => {
          setShowModalOpt(undefined);
          showModalOpt.onCancel?.()
        }}
        afterClose={() => {
          setShowModalOpt(undefined);
          showModalOpt.afterClose?.()
        }}
      /> : undefined
    }
    {
      showToastOpt ? <Toast 
        {...showToastOpt}
      /> : undefined
    }
  </UIContext.Provider>
}

const NO_INSETS_ERROR =
  'Make sure you are rendering `<UIProvider>` at the top of your app.';

export function useUI(): SDKType {
  const sdk = React.useContext(UIContext);
  if (sdk == null) {
    throw new Error(NO_INSETS_ERROR);
  }
  return sdk || {};
}

export type SDKType = {
  showModal: (opt: Omit<ModalProps, 'open'>) => void;
  showToast: (opt: Omit<ToastProps, 'open'>) => void;
  hideToast: () => void;
}
