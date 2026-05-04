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
import { useRouter, Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { validateEmail, validatePassword, validateConfirmPassword } from '../../src/utils/validators';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSignup = async () => {
    const newErrors: Record<string, string | null> = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirmPassword(password, confirm),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(e => e !== null)) return;

    try {
      setLoading(true);
      setApiError(null);
      await signUp(email, password);
      router.replace('/onboarding');
    } catch (e: any) {
      setApiError(e.message ?? 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <FontAwesome name="user-plus" size={32} color="#6366F1" />
          </View>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join us and start shopping</Text>
        </View>

        {apiError && (
          <View style={styles.errorBanner}>
            <FontAwesome name="exclamation-circle" size={14} color="#EF4444" />
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        )}

        <View style={styles.form}>
          {[
            { label: 'Email', key: 'email', value: email, setter: setEmail, placeholder: 'you@example.com', keyboard: 'email-address', secure: false },
            { label: 'Password', key: 'password', value: password, setter: setPassword, placeholder: '••••••••', keyboard: 'default', secure: true },
            { label: 'Confirm Password', key: 'confirm', value: confirm, setter: setConfirm, placeholder: '••••••••', keyboard: 'default', secure: true },
          ].map(field => (
            <View key={field.key} style={{ marginBottom: 16 }}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={[styles.input, errors[field.key] && styles.inputError]}
                placeholder={field.placeholder}
                placeholderTextColor="#94A3B8"
                keyboardType={field.keyboard as any}
                autoCapitalize="none"
                secureTextEntry={field.secure}
                value={field.value}
                onChangeText={v => { field.setter(v); setErrors(prev => ({ ...prev, [field.key]: null })); }}
              />
              {errors[field.key] && <Text style={styles.fieldError}>{errors[field.key]}</Text>}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
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
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 15, color: '#64748B', marginTop: 4 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 12,
    padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#FECACA',
  },
  errorBannerText: { color: '#EF4444', fontSize: 13, flex: 1 },
  form: {},
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    fontSize: 15, color: '#1E293B', borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 },
  primaryBtn: {
    backgroundColor: '#6366F1', borderRadius: 20,
    paddingVertical: 18, alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#64748B', fontSize: 14 },
  footerLink: { color: '#6366F1', fontSize: 14, fontWeight: '700' },
});
