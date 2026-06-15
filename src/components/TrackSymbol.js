import React from 'react';
import { View } from 'react-native';

export default function TrackSymbol({ category, size = 52, color = 'rgba(255,255,255,0.92)' }) {
  const s = size;
  const c = color;
  const dim = (ratio) => Math.floor(s * ratio);

  switch (category) {

    case 'relax': // sound wave bars
      return (
        <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: dim(0.07) }}>
            {[0.38, 0.65, 0.30, 0.58, 0.38].map((h, i) => (
              <View key={i} style={{
                width: dim(0.09),
                height: dim(h),
                borderRadius: dim(0.045),
                backgroundColor: `rgba(255,255,255,${0.55 + i * 0.08})`,
              }} />
            ))}
          </View>
          <View style={{
            position: 'absolute',
            width: dim(0.88),
            height: dim(0.88),
            borderRadius: dim(0.44),
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.18)',
          }} />
        </View>
      );

    case 'energy': // radiant star (8 rays)
      return (
        <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
          {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((deg) => (
            <View key={deg} style={{
              position: 'absolute',
              width: dim(0.72),
              height: dim(0.055),
              borderRadius: dim(0.03),
              backgroundColor: `rgba(255,255,255,${deg % 45 === 0 ? 0.75 : 0.35})`,
              transform: [{ rotate: `${deg}deg` }],
            }} />
          ))}
          <View style={{
            width: dim(0.14),
            height: dim(0.14),
            borderRadius: dim(0.07),
            backgroundColor: c,
          }} />
        </View>
      );

    case 'clear': // nested rotating squares (spiral)
      return (
        <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
          {[0, 22, 45].map((deg, i) => (
            <View key={i} style={{
              position: 'absolute',
              width: dim(0.72 - i * 0.19),
              height: dim(0.72 - i * 0.19),
              borderWidth: 1.5,
              borderColor: `rgba(255,255,255,${0.35 + i * 0.25})`,
              transform: [{ rotate: `${deg}deg` }],
            }} />
          ))}
          <View style={{
            width: dim(0.12),
            height: dim(0.12),
            borderRadius: dim(0.06),
            backgroundColor: c,
          }} />
        </View>
      );

    case 'heart': // vesica piscis (two overlapping circles)
      return (
        <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            position: 'absolute',
            width: dim(0.52),
            height: dim(0.52),
            borderRadius: dim(0.26),
            borderWidth: 1.5,
            borderColor: c,
            left: dim(0.06),
          }} />
          <View style={{
            position: 'absolute',
            width: dim(0.52),
            height: dim(0.52),
            borderRadius: dim(0.26),
            borderWidth: 1.5,
            borderColor: c,
            right: dim(0.06),
          }} />
          <View style={{
            position: 'absolute',
            width: dim(0.88),
            height: dim(0.88),
            borderRadius: dim(0.44),
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
          }} />
        </View>
      );

    case 'focus': // triple diamond (crystal)
      return (
        <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
          {[0.68, 0.44, 0.22].map((sz, i) => (
            <View key={i} style={{
              position: 'absolute',
              width: dim(sz),
              height: dim(sz),
              borderWidth: i === 0 ? 2 : 1.5,
              borderColor: `rgba(255,255,255,${0.3 + i * 0.25})`,
              transform: [{ rotate: '45deg' }],
            }} />
          ))}
          <View style={{
            width: dim(0.1),
            height: dim(0.1),
            borderRadius: dim(0.05),
            backgroundColor: c,
          }} />
        </View>
      );

    case 'balance': // yin-yang lines
      return (
        <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: dim(0.72),
            height: dim(0.72),
            borderRadius: dim(0.36),
            borderWidth: 1.5,
            borderColor: c,
          }} />
          <View style={{
            position: 'absolute',
            width: dim(0.72),
            height: 1.5,
            backgroundColor: c,
          }} />
          <View style={{
            position: 'absolute',
            width: dim(0.24),
            height: dim(0.24),
            borderRadius: dim(0.12),
            borderWidth: 1.5,
            borderColor: c,
            top: dim(0.13),
          }} />
          <View style={{
            position: 'absolute',
            width: dim(0.24),
            height: dim(0.24),
            borderRadius: dim(0.12),
            borderWidth: 1.5,
            borderColor: c,
            bottom: dim(0.13),
          }} />
        </View>
      );

    case 'mindful': // four-petal mandala
      return (
        <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
          {[0, 90].map((deg) => (
            <View key={deg} style={{
              position: 'absolute',
              width: dim(0.68),
              height: dim(0.34),
              borderRadius: dim(0.17),
              borderWidth: 1.5,
              borderColor: c,
              transform: [{ rotate: `${deg}deg` }],
            }} />
          ))}
          <View style={{
            position: 'absolute',
            width: dim(0.88),
            height: dim(0.88),
            borderRadius: dim(0.44),
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
          }} />
          <View style={{
            width: dim(0.12),
            height: dim(0.12),
            borderRadius: dim(0.06),
            backgroundColor: c,
          }} />
        </View>
      );

    case 'peace': // concentric ripple rings
    default:
      return (
        <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
          {[1, 0.72, 0.44].map((scale, i) => (
            <View key={i} style={{
              position: 'absolute',
              width: dim(scale * 0.88),
              height: dim(scale * 0.88),
              borderRadius: dim(scale * 0.44),
              borderWidth: 1.5,
              borderColor: `rgba(255,255,255,${0.2 + i * 0.2})`,
            }} />
          ))}
          <View style={{
            width: dim(0.13),
            height: dim(0.13),
            borderRadius: dim(0.065),
            backgroundColor: c,
          }} />
        </View>
      );
  }
}
