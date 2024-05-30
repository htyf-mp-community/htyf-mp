import { useEffect, useRef } from "react";
import { Animated } from "react-native";

function AnimateWrap(props: {className?: string, children?: any}) {
  const fadeAnim = useRef(new Animated.Value(0));
  const topAnim = useRef(new Animated.Value(500));

  const fadeIn = () => {
    Animated.timing(fadeAnim.current, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(topAnim.current, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim.current, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(topAnim.current, {
      toValue: 500,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    fadeIn();
    return () => {
      fadeOut();
    }
  }, [])
  
  return <Animated.View
    style={{ 
      opacity: fadeAnim.current,
      transform: [
        {
          translateY: topAnim.current,
        }
      ]
    }}
  >
    {props.children}
  </Animated.View>
}

export default AnimateWrap;