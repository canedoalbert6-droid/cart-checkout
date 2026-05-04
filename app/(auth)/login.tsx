import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri, AuthSessionResult } from 'expo-auth-session';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { validateEmail, validatePassword } from '../../src/utils/validators';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth discovery document
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const redirectUri = makeRedirectUri({ scheme: 'cartcheckout' });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token',      // string literal — no enum needed
      usePKCE: false,
      extraParams: { nonce: 'nonce' },
    },
    GOOGLE_DISCOVERY,
  );

  React.useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = (response as any).params?.id_token as string | undefined;
      if (!idToken) {
        setApiError('Google sign-in did not return an ID token.');
        return;
      }
      setGoogleLoading(true);
      signInWithGoogle(idToken)
        .then(() => router.replace('/(drawer)'))
        .catch((e: any) => setApiError(e.message ?? 'Google sign-in failed.'))
        .finally(() => setGoogleLoading(false));
    } else if (response.type === 'error') {
      const msg = (response as any).error?.message as string | undefined;
      setApiError(msg ?? 'Google sign-in was cancelled or failed.');
    }
  }, [response]);

  const handleLogin = async () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    try {
      setLoading(true);
      setApiError(null);
      await signIn(email, password);
      router.replace('/(drawer)');
    } catch (e: any) {
      setApiError(e.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <FontAwesome name="shopping-bag" size={36} color="#6366F1" />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue shopping</Text>
        </View>

        {/* API Error Banner */}
        {apiError && (
          <View style={styles.errorBanner}>
            <FontAwesome name="exclamation-circle" size={14} color="#EF4444" />
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={v => { setEmail(v); setEmailError(null); }}
            />
            {emailError && <Text style={styles.fieldError}>{emailError}</Text>}
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordError && styles.inputError]}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={v => { setPassword(v); setPasswordError(null); }}
            />
            {passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Sign In</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={[styles.googleBtn, (googleLoading || !request) && styles.btnDisabled]}
            onPress={() => promptAsync({})}
            disabled={googleLoading || !request}
          >
            {googleLoading
              ? <ActivityIndicator color="#6366F1" />
              : (
                <>
                  <FontAwesome name="google" size={18} color="#EA4335" />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flexGrow: 1, padding: 28, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 15, color: '#64748B', marginTop: 4 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 12,
    padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#FECACA',
  },
  errorBannerText: { color: '#EF4444', fontSize: 13, flex: 1 },
  form: { gap: 4 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, fontSize: 15, color: '#1E293B',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 },
  primaryBtn: {
    backgroundColor: '#6366F1', borderRadius: 20,
    paddingVertical: 18, alignItems: 'center', marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 20, paddingVertical: 16,
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  googleBtnText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#64748B', fontSize: 14 },
  footerLink: { color: '#6366F1', fontSize: 14, fontWeight: '700' },
});
