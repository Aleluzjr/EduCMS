import { useState, useCallback } from 'react';

interface UsePasswordFieldReturn {
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  inputType: 'text' | 'password';
}

export function usePasswordField(): UsePasswordFieldReturn {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const inputType = showPassword ? 'text' : 'password';

  return {
    showPassword,
    togglePasswordVisibility,
    inputType
  };
} 