import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => Record<keyof T, string> | null;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  loading: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  setLoading: (loading: boolean) => void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [loading, setLoading] = useState(false);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({} as Record<keyof T, string>);
    
    // Validate form if validation function exists
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors) {
        setErrors(validationErrors);
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setLoading(false);
  }, [initialValues]);

  return {
    values,
    errors,
    loading,
    setFieldValue,
    setFieldError,
    handleSubmit,
    reset,
    setLoading
  };
} 