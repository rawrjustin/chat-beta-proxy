export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // --- Length ---
  if (password.length < 10) {
    errors.push('Password must be at least 10 characters long.');
  }

  // --- Complexity ---
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    errors.push(
      'Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
    );
  }
  return { valid: errors.length === 0, errors };
}
