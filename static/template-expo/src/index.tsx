import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import React, { forwardRef, memo, useEffect } from 'react'
import { StoreProvider, UIProvider, useAppSelector } from '@/_UIHOOKS_'

import createRouter from './router'
import { NavigationContainer } from '@react-navigation/native';

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
  return (
    <NavigationContainer>
      <StoreProvider>
        <UIProvider>
          <RootFix />
        </UIProvider>
      </StoreProvider>
    </NavigationContainer>
  );
});


export default memo(MiniApp);

