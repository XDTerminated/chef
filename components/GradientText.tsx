import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface GradientTextProps {
  children: string;
  colors: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  style?: any;
}

export default function GradientText({
  children,
  colors = ['#40ffaa', '#4079ff'],
  animationSpeed = 2,
  showBorder = false,
  style,
}: GradientTextProps) {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    animationValue.value = withRepeat(
      withTiming(1, { duration: animationSpeed * 1000 }),
      -1,
      true
    );
  }, [animationValue, animationSpeed]);

  const animatedStyle = useAnimatedStyle(() => {
    const colorIndex = interpolate(
      animationValue.value,
      [0, 1],
      [0, colors.length - 1]
    );
    
    // Simple color interpolation between the first two colors
    const currentColor = colors[Math.floor(colorIndex) % colors.length];
    
    return {
      color: currentColor,
      textShadowColor: showBorder ? '#000' : 'transparent',
      textShadowOffset: showBorder ? { width: 1, height: 1 } : { width: 0, height: 0 },
      textShadowRadius: showBorder ? 2 : 0,
    };
  });

  return (
    <Animated.Text style={[styles.text, style, animatedStyle]}>
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});