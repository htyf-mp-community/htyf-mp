import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import lodash from 'lodash';
import * as routerConf from '@/pages';

const RootStack = createStackNavigator();

export const allPages = routerConf;
export const routers = lodash.compact(Object.keys(allPages));

export default function createRouter(): React.ComponentType<any> {
  function Router() {
    return (
      <RootStack.Navigator
        initialRouteName={'Home'}
        screenOptions={{
          headerMode: 'screen',
          headerShown: false,
        }}>
        {routers.map(name => {
          const PageComponent = lodash.get(allPages, name, undefined);
          console.log('PageComponent', PageComponent);
          if (PageComponent === undefined) {
            return undefined;
          }
          return (
            <RootStack.Screen
              key={name}
              name={name}
              component={PageComponent}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              }}
            />
          );
        })}
      </RootStack.Navigator>
    );
  }

  return Router;
}
