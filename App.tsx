import {StatusBar} from 'expo-status-bar';
import {StyleSheet, useWindowDimensions, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming, Easing} from 'react-native-reanimated'
import {useEffect} from "react";

const FPS = 60
const deltaTime = 1000 / FPS
const speed = 5
const ballWidth = 25
const normaliseVector = (vector: {x: number, y: number}) => {
  const mangnitude = Math.sqrt(vector.x*vector.x + vector.y*vector.y)
  return {
    x: vector.x / mangnitude,
    y: vector.y / mangnitude
  }
}

export default function App() {
  const targetPositionX = useSharedValue(200)
  const targetPositionY = useSharedValue(200)
  const direction = useSharedValue(normaliseVector({x: Math.random(), y: Math.random()}))
  const {height, width} = useWindowDimensions()

  useEffect(() => {
    const interval = setInterval(update, deltaTime)

    return () => clearInterval(interval)
  }, []);

  const update = () => {
    let next = getNextPosition(direction.value)

    if(next.y < 0 || next.y > height - ballWidth) {
      const newDirection = {x: direction.value.x, y: -direction.value.y}
      direction.value = newDirection
      next = getNextPosition(newDirection)
    }
    if(next.x < 0 || next.x > width - ballWidth) {
      const newDirection = {x: -direction.value.x, y: direction.value.y}
      direction.value = newDirection
      next = getNextPosition(newDirection)
    }
    targetPositionX.value = withTiming(next.x, {
      duration: deltaTime,
      easing: Easing.linear
    })
    targetPositionY.value = withTiming(next.y, {
      duration: deltaTime,
      easing: Easing.linear
    })
  }

  const ballAnimatedStyle = useAnimatedStyle(() => {
    return {
      top: targetPositionY.value,
      left: targetPositionX.value
    }
  })

  const getNextPosition = (position: {x: number, y: number}) => {
    return {
      x: targetPositionX.value + position.x * speed,
      y: targetPositionY.value + position.y * speed
    }
  }

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.ball, ballAnimatedStyle]}/>
            <StatusBar style="auto"/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ball: {
        backgroundColor: '#000',
        borderRadius: 999,
        width: ballWidth,
        aspectRatio: 1,
        position: 'absolute',
    }
});
