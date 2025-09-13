import Svg, { Line, Path } from 'react-native-svg';

interface ChefLogoProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function ChefLogo({
  width = 80,
  height = 80,
  color = '#000',
}: ChefLogoProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 128 128"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 1. Hat – outer silhouette */}
      <Path
        d="
          M24 70
          C24 40 44 26 64 26
          C84 26 104 40 104 70
          L104 90
          H24
          Z
        "
        fill="none"
        stroke={color}
        strokeWidth={3}
      />

      {/* 2. Hat pleats */}
      {([40, 50, 64, 78, 88] as const).map(x => (
        <Line
          key={x}
          x1={x}
          y1={46}
          x2={x}
          y2={70}
          stroke={color}
          strokeWidth={2}
        />
      ))}

      {/* 3. Base band */}
      <Path
        d="M20 90 H108"
        stroke={color}
        strokeWidth={6}
      />

      {/* 4. Spoon (left) */}
      <Path
        d="
          M38 78
          Q30 60 38 48
          Q46 60 38 78
          M38 78
          L38 106
        "
        fill="none"
        stroke={color}
        strokeWidth={3}
      />

      {/* 5. Fork (right) */}
      <Path
        d="
          M90 48 L90 106
          M90 48
            l-4 -6
            m 4 6
            l4 -6
          M90 62 l-4 -4
          M90 62 l4 -4
          M90 70 l-4 -4
          M90 70 l4 -4
        "
        fill="none"
        stroke={color}
        strokeWidth={3}
      />

      {/* 6. Steam / flourish */}
      <Path
        d="
          M54 32
          q5 -6 10 0
          q5 6 10 0
          q5 -6 10 0
        "
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}
