export interface ValidationResult {
  [key: string]: string;
}

export const validators = {
  required: (value: string, fieldName: string): string | null => {
    if (!value || !value.trim()) {
      return `${fieldName} é obrigatório`;
    }
    return null;
  },

  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Email inválido';
    }
    return null;
  },

  minLength: (value: string, minLength: number, fieldName: string): string | null => {
    if (value && value.length < minLength) {
      return `${fieldName} deve ter pelo menos ${minLength} caracteres`;
    }
    return null;
  },

  passwordMatch: (password: string, confirmPassword: string): string | null => {
    if (password !== confirmPassword) {
      return 'As senhas não coincidem';
    }
    return null;
  },

  strongPassword: (password: string): string | null => {
    if (password && password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    return null;
  }
};

export const validateForm = (
  values: Record<string, any>,
  rules: Record<string, Array<(value: any, ...args: any[]) => string | null>>
): ValidationResult | null => {
  const errors: ValidationResult = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const error = rule(values[field], field);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}; 