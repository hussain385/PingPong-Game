import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import Animated, {
    Easing,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated'
import {useEffect, useState} from "react";
import {PanGestureHandler} from "react-native-gesture-handler";

const FPS = 60
const deltaTime = 1000 / FPS
const speed = 10
const ballWidth = 25
const island = {x: 134, y: 11, w: 127, h: 37}
const normaliseVector = (vector: { x: number, y: number }) => {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
    return {
        x: vector.x / magnitude,
        y: vector.y / magnitude
    }
}

const Game = () => {
    const targetPositionX = useSharedValue(200)
    const targetPositionY = useSharedValue(200)
    const direction = useSharedValue(normaliseVector({x: Math.random(), y: Math.random()}))
    const {height, width} = useWindowDimensions()
    const player = {x: width / 4, y: height - 100, w: width / 2, h: 37}
    const playerPos = useSharedValue({x: width / 4, y: height - 100})
    const [score, setScore] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);

    useEffect(() => {
        const interval = setInterval(update, deltaTime)

        return () => clearInterval(interval)
    }, []);

    const update = () => {
        let next = getNextPosition(direction.value)
        let newDirection = direction.value

        //wall detection
        if (next.y < 0 || next.y > height - ballWidth) {
            newDirection = {x: direction.value.x, y: -direction.value.y}
        }
        if (next.x < 0 || next.x > width - ballWidth) {
            newDirection = {x: -direction.value.x, y: direction.value.y}
        }

        //island detection
        if (
            next.x < island.x + island.w &&
            next.x + ballWidth > island.x &&
            next.y < island.y + island.h &&
            next.y + ballWidth > island.y
        ) {
            if (targetPositionX.value < island.x || targetPositionX.value > island.x + island.w) {
                newDirection = {x: -direction.value.x, y: direction.value.y}
            } else {
                newDirection = {x: direction.value.x, y: -direction.value.y}
            }
            setScore(prevState => prevState + 1)
        }

        //player detection
        if (
            next.x < playerPos.value.x + player.w &&
            next.x + ballWidth > playerPos.value.x &&
            next.y < playerPos.value.y + player.h &&
            next.y + ballWidth > playerPos.value.y
        ) {
            if (targetPositionX.value < playerPos.value.x || targetPositionX.value > playerPos.value.x + player.w) {
                newDirection = {x: -direction.value.x, y: direction.value.y}
            } else {
                newDirection = {x: direction.value.x, y: -direction.value.y}
            }
        }

        direction.value = newDirection
        next = getNextPosition(newDirection)

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

    const getNextPosition = (position: { x: number, y: number }) => {
        return {
            x: targetPositionX.value + position.x * speed,
            y: targetPositionY.value + position.y * speed
        }
    }

    const playerAnimatedStyles = useAnimatedStyle(() => ({
        left: playerPos.value.x
    }))

    const ponGestureHandler = useAnimatedGestureHandler({
        onStart: (event) => {
        },
        onActive: (event: any) => {
            if (playerPos.value.x >= 0 && playerPos.value.x <= width - player.w) {
                playerPos.value = {
                    ...playerPos.value,
                    x: event.absoluteX - player.w / 2 <= 0
                        ? 0
                        : event.absoluteX - player.w / 2 >= width - player.w
                            ? width - player.w
                            : event.absoluteX - player.w / 2
                }
            }
        }
    })

    return (
        <>
            {/*score*/}
            <Text style={styles.scoreText}>{score}</Text>

            {/*ball*/}
            <Animated.View style={[styles.ball, ballAnimatedStyle]}/>

            {/*island*/}
            <Animated.View style={{
                top: island.y,
                left: island.x,
                position: 'absolute',
                width: island.w,
                height: island.h,
                backgroundColor: 'black',
                borderRadius: 20
            }}/>

            {/*player*/}
            <Animated.View style={[{
                top: playerPos.value.y,
                position: 'absolute',
                width: player.w,
                height: player.h,
                backgroundColor: 'black',
                borderRadius: 20
            }, playerAnimatedStyles]}/>

            <PanGestureHandler onGestureEvent={ponGestureHandler}>
                <Animated.View style={{
                    bottom: 0,
                    position: 'absolute',
                    width: '100%',
                    height: 200,
                }}/>
            </PanGestureHandler>
        </>
    );
};

export default Game;

const styles = StyleSheet.create({
    ball: {
        backgroundColor: '#000',
        borderRadius: 999,
        width: ballWidth,
        aspectRatio: 1,
        position: 'absolute',
    },
    scoreText: {
        fontSize: 150,
        fontWeight: '500',
        position: 'absolute',
        top: 200,
        color: 'rgba(218,217,226,0.69)'
    }
});
