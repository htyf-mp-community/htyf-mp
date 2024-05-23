import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native'
import { useAppSelector } from './store';


const isDev = process.env.NODE_ENV !== 'production';

export const UIContext = React.createContext<any>(null);

if (isDev) {
  UIContext.displayName = '__DGZ_UIContext___';
}

export interface UIProviderProps {
  children: ReactNode | Function;
}

export const UIProvider = (props: UIProviderProps) => {
  const [isClient, setIsClient] = useState(false)
  const apps = useAppSelector(state => state.apps);
  const { __ENV__ } = apps;

  useEffect(() => {
    setIsClient(true)
  }, [])

  return <UIContext.Provider
    value={{
     
    } as SDKType}
  >
    {
      isClient && __ENV__ !== 'MASTER' ? <View
      >
        <Text style={{ fontSize: 10, color: '#fff' }}>{__ENV__}</Text>
      </View> : undefined
    }
    {
      typeof props.children === 'function' ? props.children() : props?.children
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

export interface SocketConfig {
 
}

export type SDKType = {
}
