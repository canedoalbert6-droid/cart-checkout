// --- Email ---
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Please enter a valid email address.';
  return null;
};

// --- Password ---
export const validatePassword = (password: string): string | null => {
  if (!password || password.length === 0) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
};

export const validateConfirmPassword = (password: string, confirm: string): string | null => {
  if (!confirm || confirm.length === 0) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
};

// --- Cart total ---
export const calculateTotal = (items: { quantity: number; price_at_add: number }[]): number => {
  return items.reduce((sum, item) => sum + item.quantity * item.price_at_add, 0);
};
