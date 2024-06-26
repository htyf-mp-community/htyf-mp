import React from 'react'
import { View, Text, Image } from 'react-native';
import logo from '../assets/images/logo-lg.png'


const MiniApp = () => {
  return <View style={{
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
  }}>
    <Text style={{color: 'red', fontSize: 30,}}>DEMO</Text>
    <View>
      <Image  
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red'
        }}
        source={logo}
      />
    </View>
  </View>
}


export default MiniApp;

