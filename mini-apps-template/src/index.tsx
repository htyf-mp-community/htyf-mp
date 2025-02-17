import React from 'react'
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import jssdk from '@htyf-mp/js-sdk'
import logo from '../assets/images/logo-lg.png'


const MiniApp = () => {
  return <View style={{
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
  }}>
    <Text style={{color: 'red', fontSize: 30,}}>DEMO</Text>
    <View>
      <TouchableOpacity
        onPress={async () => {
          const data = await jssdk.openImages({
            images: [
              logo
            ],
            imageIndex: 0,
          })
        }}
      >
        <Image  
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ccc'
          }}
          source={logo}
        />
      </TouchableOpacity>
    </View>
    <TouchableOpacity
      onPress={async () => {
        const data = await jssdk.openQR()
        Alert.alert('二维码', JSON.stringify(data))
      }}
    >
      <Text>打开二维码</Text>
    </TouchableOpacity>
  </View>
}


export default MiniApp;

