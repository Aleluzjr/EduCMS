import React from 'react';
import Input from '../ui/Input';
import { Field } from '../../types';

interface TextFieldProps {
  field: Field;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function TextField({ field, value, onChange, error, disabled }: TextFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Input
      label={field.label}
      value={value}
      onChange={handleChange}
      required={field.required}
      placeholder={field.placeholder}
      error={error}
      disabled={disabled}
      id={`field-${field.id}`}
      name={field.name}
      type="text"
      maxLength={field.validation?.maxLength}
      minLength={field.validation?.minLength}
      pattern={field.validation?.pattern}
    />
  );
}
