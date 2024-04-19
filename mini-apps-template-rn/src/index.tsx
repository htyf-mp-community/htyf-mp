import { Alert, StatusBar } from 'react-native'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import { useSafeAreaInsets, initialWindowMetrics, useSafeAreaFrame } from 'react-native-safe-area-context'
import {StoreProvider, UIProvider, useAppSelector} from '@/_UIHOOKS_'

import { minisdkRef } from './utils'

import createRouter from './router'

const RootStack = createStackNavigator();

const router = createRouter();

function RootFix(props: any) {
	const appStore = useAppSelector(i => i);
	useEffect(() => {
		console.log(appStore)
	}, [])
	return <RootStack.Navigator
    initialRouteName={'MainScreen'}
    screenOptions={{
      headerShown: false,
      presentation: 'modal',
    }}>
      <RootStack.Screen
        name={'MainScreen'}
        component={router}
        options={{
          cardStyleInterpolator:
            CardStyleInterpolators.forVerticalIOS,
        }}
      />
  </RootStack.Navigator>
}


const MiniApp = forwardRef(({ dataSupper, minisdk }: any, ref) => {
  console.log(dataSupper)
  const insets = useSafeAreaInsets();
  const frame = useSafeAreaFrame();
  useEffect(() => {
    minisdkRef.current = minisdk;
  }, [minisdk]);
  useEffect(() => {
    /** 修复 useSafeAreaInsets 修复未触发 */
    if (
      JSON.stringify(insets) !== JSON.stringify(initialWindowMetrics?.insets) || 
      JSON.stringify(frame) !== JSON.stringify(initialWindowMetrics?.frame) 
    ) {
      setTimeout(i => {
        StatusBar.setHidden(true)
        StatusBar.setHidden(false)
      }, 0)
    }
  }, [])
  useImperativeHandle(ref, () => ({
    // Do not edit
    getData: () => {
      return 'Mini app data'
    },
  }))
  return (
    <StoreProvider>
      <UIProvider>
        <RootFix />
      </UIProvider>
    </StoreProvider>
  );
});


export default MiniApp;

