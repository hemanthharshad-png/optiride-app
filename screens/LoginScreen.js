/**
 * LoginScreen.js — OptiRide
 * Phase 2: seamless #1A0B2E → #000000 gradient, iOS 18-style fluid glass
 * panel, instant neon focus glow, Google auth, keyboard-safe layout.
 *
 * KEYBOARD SAFETY:
 * - TextInputs live in plain Views (no Animated wrappers, no loops).
 * - Decorative glows are static + pointerEvents="none".
 * - Whole form wrapped in KeyboardAvoidingView + ScrollView.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

const NOTCH_PADDING =
  Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 50;

const COLORS = {
  neon: '#5944FF',
  white: '#FFFFFF',
  muted: '#888888',
  panel: 'rgba(25, 25, 30, 0.7)',
  panelBorder: 'rgba(255, 255, 255, 0.08)',
  inputBg: 'rgba(0, 0, 0, 0.5)',
  inputBorder: 'rgba(255, 255, 255, 0.05)',
  googleBlue: '#4285F4',
  googleBtnBg: 'rgba(255, 255, 255, 0.04)',
  googleBtnBorder: 'rgba(255, 255, 255, 0.15)',
  divider: 'rgba(255, 255, 255, 0.08)',
  error: '#FF5D7A',
  linkLavender: '#BDBDFF',
};

export default function LoginScreen({
  brandName = 'OptiRide',
  tagline = 'Move the city. Arrive first.',
  navigation,
  onLogin,
  onGoogle,
  onForgotPassword,
  onCreateAccount,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null); // 'email' | 'password' | null
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef(null);
  const cardEntrance = useRef(new Animated.Value(0)).current; // one-shot, not a loop

  useEffect(() => {
    Animated.timing(cardEntrance, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [cardEntrance]);

  const clearError = (key) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = () => {
    if (submitting) return;
    Keyboard.dismiss();
    if (!validate()) return;
    setSubmitting(true);
    // Replace with your auth call.
    setTimeout(() => {
      setSubmitting(false);
      if (onLogin) onLogin({ email: email.trim(), password });
      else if (navigation?.replace) navigation.replace('Home');
      else Alert.alert('Welcome back', `Signed in as ${email.trim()}`);
    }, 1400);
  };

  const handleGoogle = () => {
    Keyboard.dismiss();
    if (onGoogle) onGoogle();
    else Alert.alert('Google sign-in', 'Redirecting to Google…');
  };

  return (
    <LinearGradient
      colors={['#1A0B2E', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.root}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Static ambient glows — can never block input */}
      <View pointerEvents="none" style={styles.orbTop} />
      <View pointerEvents="none" style={styles.orbBottom} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardEntrance,
                transform: [
                  {
                    translateY: cardEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Brand header — location-sharp, no car logos */}
            <View style={styles.info}>
              <View style={styles.logoBadge}>
                <Ionicons name="location-sharp" size={28} color={COLORS.white} />
              </View>
              <Text style={styles.title}>{brandName}</Text>
              <Text style={styles.tagline}>{tagline}</Text>
              <View style={styles.statsRow}>
                <Ionicons name="star" size={12} color="#FFC94D" />
                <Text style={styles.statsText}>
                  {' '}
                  <Text style={styles.statsStrong}>4.9</Text> · 2M+ riders
                </Text>
              </View>
            </View>

            {/* Email — plain View shell, fully clickable */}
            <View style={styles.field}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View
                style={[
                  styles.inputShell,
                  focusedField === 'email' && styles.inputShellFocused,
                  errors.email && styles.inputShellError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={focusedField === 'email' ? COLORS.neon : COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError('email');
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  selectionColor={COLORS.neon}
                  accessibilityLabel="Email address"
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>PASSWORD</Text>
                <TouchableOpacity
                  onPress={() =>
                    onForgotPassword
                      ? onForgotPassword()
                      : Alert.alert('Reset password', 'A reset link will be sent to your email.')
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.forgotLink}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputShell,
                  focusedField === 'password' && styles.inputShellFocused,
                  errors.password && styles.inputShellError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={focusedField === 'password' ? COLORS.neon : COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  selectionColor={COLORS.neon}
                  accessibilityLabel="Password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.eyeButton}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={showPassword ? COLORS.white : COLORS.muted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Primary CTA */}
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              disabled={submitting}
              onPress={handleLogin}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryText}>SIGN IN</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={COLORS.white}
                    style={styles.primaryIcon}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google auth — official blue G, iOS scale press */}
            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.7}
              onPress={handleGoogle}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
            >
              <View style={styles.googleCircle}>
                <FontAwesome name="google" size={17} color={COLORS.googleBlue} />
              </View>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Under-card footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don’t have an account?{' '}
              <Text
                style={styles.footerLink}
                onPress={() =>
                  onCreateAccount
                    ? onCreateAccount()
                    : Alert.alert('Create account', 'Sign-up flow goes here.')
                }
              >
                Create one
              </Text>
            </Text>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },

  /* Ambient glows — static, non-interactive */
  orbTop: {
    position: 'absolute',
    top: '3%',
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(89, 68, 255, 0.18)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: '10%',
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0, 229, 255, 0.07)',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: NOTCH_PADDING + 8,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },

  /* iOS 18 fluid glass panel */
  card: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 26,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 26,
    elevation: 14,
  },

  /* Brand */
  info: { alignItems: 'center', marginBottom: 24 },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(89, 68, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(89, 68, 255, 0.45)',
    marginBottom: 14,
  },
  title: { color: COLORS.white, fontSize: 26, fontWeight: '800', letterSpacing: 1.5 },
  tagline: { color: COLORS.muted, fontSize: 13, marginTop: 6 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  statsText: { color: COLORS.muted, fontSize: 12 },
  statsStrong: { color: COLORS.white, fontWeight: '700' },

  /* Fields */
  field: { marginBottom: 16 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  forgotLink: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputShellFocused: {
    borderColor: COLORS.neon,
    shadowColor: COLORS.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  inputShellError: { borderColor: COLORS.error },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
  eyeButton: { marginLeft: 8, padding: 4 },
  errorText: {
    color: COLORS.error,
    fontSize: 11.5,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },

  /* Primary CTA */
  primaryButton: {
    marginTop: 4,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.neon,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.neon,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryText: { color: COLORS.white, fontSize: 16, fontWeight: '800', letterSpacing: 1.2 },
  primaryIcon: { marginLeft: 8, marginTop: 1 },

  /* Divider */
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.divider },
  dividerText: {
    color: COLORS.muted,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 2,
    marginHorizontal: 12,
  },

  /* Google auth */
  googleButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.googleBtnBg,
    borderWidth: 1,
    borderColor: COLORS.googleBtnBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  googleCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

  /* Footer */
  footer: { alignItems: 'center', marginTop: 22 },
  footerText: { color: COLORS.muted, fontSize: 13 },
  footerLink: { color: COLORS.white, fontWeight: '800' },
  termsText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  termsLink: { color: COLORS.linkLavender, fontWeight: '700' },
});