import React from 'react';
import { Button, Text, View } from 'react-native';
import { useAppSelector } from '@/_UIHOOKS_';
import jssdk from '@htyf-mp/js-sdk';
import { useNavigation, useRoute } from '@react-navigation/native';

function App() {
  const router = useRoute();
  const apps = useAppSelector(i => i.apps)
  const navigation = useNavigation();
  return <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  }}>
    <Text>details: {JSON.stringify(router.params)}</Text>
    <Button
      title='返回'
      onPress={() => {
        navigation.goBack();
      }}
    />
  </View>;
}

export default App;
