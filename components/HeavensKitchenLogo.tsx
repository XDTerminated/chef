import React from 'react';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

interface HeavensKitchenLogoProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function HeavensKitchenLogo({ 
  width = 128, 
  height = 128, 
  color = '#000' 
}: HeavensKitchenLogoProps) {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 128 128" 
      fill="none"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Halo */}
      <Ellipse 
        cx="64" 
        cy="28" 
        rx="22" 
        ry="8" 
        fill="gold" 
        stroke="orange" 
        strokeWidth="3"
      />

      {/* Steam */}
      <Path 
        d="M50 40c-4-6 4-10 0-14" 
        stroke="#aaa" 
        strokeWidth="2" 
        opacity="0.6"
      />
      <Path 
        d="M78 40c-4-6 4-10 0-14" 
        stroke="#aaa" 
        strokeWidth="2" 
        opacity="0.6"
      />

      {/* Lid */}
      <Path 
        d="M22 56h84" 
        stroke="#333" 
        strokeWidth="3"
      />
      <Path 
        d="M34 56c8-14 52-14 60 0" 
        stroke="#333" 
        strokeWidth="3"
      />
      <Path 
        d="M64 44v-6" 
        stroke="#333" 
        strokeWidth="3"
      />

      {/* Pot body */}
      <Rect 
        x="20" 
        y="58" 
        width="88" 
        height="42" 
        rx="8" 
        fill="#666" 
        stroke="#333" 
        strokeWidth="3"
      />

      {/* Handles */}
      <Path 
        d="M20 68c-6 0-10 4-10 9s4 9 10 9" 
        stroke="#333" 
        strokeWidth="3"
      />
      <Path 
        d="M108 68c6 0 10 4 10 9s-4 9-10 9" 
        stroke="#333" 
        strokeWidth="3"
      />

      {/* Ladle */}
      <Path 
        d="M90 90c0 8-8 14-16 10-4-2-6-6-6-10 0-5 3-8 7-10" 
        fill="#bbb" 
        stroke="#222" 
        strokeWidth="3"
      />
      <Path 
        d="M75 80l23-33" 
        stroke="#222" 
        strokeWidth="3"
      />
      <Path 
        d="M98 47l5-7" 
        stroke="#222" 
        strokeWidth="3"
      />
    </Svg>
  );
}
