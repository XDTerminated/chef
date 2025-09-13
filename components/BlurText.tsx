import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: 'words' | 'characters';
  direction?: 'top' | 'bottom' | 'left' | 'right';
  onAnimationComplete?: () => void;
  style?: any;
}

export default function BlurText({
  text,
  delay = 0,
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
  style,
}: BlurTextProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(direction === 'top' ? -50 : direction === 'bottom' ? 50 : 0);
  const translateX = useSharedValue(direction === 'left' ? -50 : direction === 'right' ? 50 : 0);

  useEffect(() => {
    const animate = () => {
      opacity.value = withDelay(delay, withTiming(1, { duration: 1000 }));
      translateY.value = withDelay(delay, withTiming(0, { duration: 1000 }));
      translateX.value = withDelay(delay, withTiming(0, { duration: 1000 }));
      
      if (onAnimationComplete) {
        setTimeout(() => {
          runOnJS(onAnimationComplete)();
        }, delay + 1000);
      }
    };

    animate();
  }, [delay, opacity, translateY, translateX, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
    };
  });

  return (
    <Animated.Text style={[styles.text, style, animatedStyle]}>
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  word: {
    // Individual word styles can be added here if needed
  },
});