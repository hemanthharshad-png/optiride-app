import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const NOTCH_PADDING =
  Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 50;

const COLORS = {
  neon: '#5944FF',
  white: '#FFFFFF',
  muted: '#888888',
};

export default function SplashScreen({ navigation, onFinish }) {
  const spin = useRef(new Animated.Value(0)).current; // spinner rotation
  const pulse = useRef(new Animated.Value(0)).current; // logo breathing
  const progress = useRef(new Animated.Value(0)).current; // 2s check timer
  const exit = useRef(new Animated.Value(0)).current; // fade/scale-out
  const finished = useRef(false);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    spinLoop.start();
    pulseLoop.start();

    // Simulated Firebase session check — exactly 2 seconds.
    const check = Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: false, // drives bar width
    });

    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      spinLoop.stop();
      pulseLoop.stop();
      check.stop();
      clearTimeout(failsafe);

      // Smooth fade + scale out, then hand off.
      Animated.timing(exit, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        if (navigation?.replace) navigation.replace('Login');
        else if (onFinish) onFinish();
      });
    };

    check.start(({ finished: done }) => {
      if (done) finish();
    });

    const failsafe = setTimeout(finish, 2600);

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
      check.stop();
      clearTimeout(failsafe);
    };
  }, [spin, pulse, progress, exit, navigation, onFinish]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const breathe = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const exitOpacity = exit.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const exitScale = exit.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });
  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#1A0B2E', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.root}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View
        style={[
          styles.content,
          { opacity: exitOpacity, transform: [{ scale: exitScale }] },
        ]}
      >
        {/* Ambient glows — static, non-interactive */}
        <View pointerEvents="none" style={styles.orbTop} />
        <View pointerEvents="none" style={styles.orbBottom} />

        <View style={styles.hero}>
          {/* ---- Geometric spinner ---- */}
          <View style={styles.spinnerWrap}>
            {/* Outer ring + rotating neon arc */}
            <View style={styles.ring}>
              <Animated.View style={[styles.arc, { transform: [{ rotate }] }]} />
            </View>

            {/* Rotating diamond (spins + breathes) */}
            <Animated.View
              style={[
                styles.diamondWrap,
                { transform: [{ rotate }, { scale: breathe }] },
              ]}
            >
              <View style={styles.diamondOuter} />
              <View style={styles.diamondInner} />
            </Animated.View>

            {/* Static logo badge — never rotates */}
            <View style={styles.logoBadge}>
              <Ionicons name="location-sharp" size={32} color={COLORS.white} />
            </View>
          </View>

          <Text style={styles.brand}>OptiRide</Text>
          <Text style={styles.tagline}>Move the city. Arrive first.</Text>
          <Text style={styles.status}>Verifying secure session…</Text>

          {/* 2-second progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]} />
          </View>
        </View>

        <Text style={styles.footer}>OptiRide · Secure by design</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, alignItems: 'center' },

  /* Ambient glows */
  orbTop: {
    position: 'absolute',
    top: '4%',
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(89, 68, 255, 0.18)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: '12%',
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },

  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: NOTCH_PADDING + 24,
  },

  /* Spinner stack */
  spinnerWrap: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 34,
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arc: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderTopColor: COLORS.neon,
    borderRightColor: 'rgba(89, 68, 255, 0.35)',
  },
  diamondWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamondOuter: {
    width: 66,
    height: 66,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(89, 68, 255, 0.85)',
    backgroundColor: 'rgba(89, 68, 255, 0.10)',
    transform: [{ rotate: '45deg' }],
  },
  diamondInner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    transform: [{ rotate: '45deg' }],
  },
  logoBadge: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(89, 68, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(89, 68, 255, 0.5)',
  },

  /* Brand copy */
  brand: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tagline: { color: COLORS.muted, fontSize: 13, marginTop: 8 },
  status: { color: COLORS.muted, fontSize: 12, marginTop: 24 },

  /* Progress bar */
  progressTrack: {
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.neon,
  },

  footer: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 20,
  },
});