import React, { useState } from 'react';
import TextField from './fields/TextField';
import TextareaField from './fields/TextareaField';
import HtmlField from './fields/HtmlField';
import MediaField from './fields/MediaField';
import RepeatableField from './fields/RepeatableField';

interface Field {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  defaultValue?: any;
  accept?: string;
  fields?: Field[];
}

interface SlideTemplate {
  id: string;
  name: string;
  icon: string;
  fields: Field[];
}

interface SlideEditorProps {
  slide: any;
  template?: SlideTemplate;
  onUpdate: (slideData: any) => void;
}

export default function SlideEditor({ slide, template, onUpdate }: SlideEditorProps) {
  const [uploading, setUploading] = useState(false);

  const API_BASE = 'http://localhost:3001/api';

  // O slide é sempre controlado pelo pai, não precisa de estado local duplicado

  const handleFieldChange = (fieldName: string, value: any) => {
    const newSlideData = {
      ...slide,
      [fieldName]: value
    };
    onUpdate(newSlideData);
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      handleFieldChange(fieldName, result);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload do arquivo');
    }
    setUploading(false);
  };

  const addRepeatableItem = (fieldName: string, template: Field[]) => {
    const currentItems = slide[fieldName] || [];
    const newItem: any = { id: Date.now() };
    template.forEach(field => {
      newItem[field.name] = field.defaultValue || '';
    });
    handleFieldChange(fieldName, [...currentItems, newItem]);
  };

  const updateRepeatableItem = (fieldName: string, index: number, itemFieldName: string, value: any) => {
    const items = [...(slide[fieldName] || [])];
    items[index] = {
      ...items[index],
      [itemFieldName]: value
    };
    handleFieldChange(fieldName, items);
  };

  const removeRepeatableItem = (fieldName: string, index: number) => {
    const items = slide[fieldName] || [];
    handleFieldChange(fieldName, items.filter((_: any, i: number) => i !== index));
  };

  const renderField = (field: Field) => {
    const value = slide[field.name] || '';
    if (field.type === 'text') {
      return (
        <TextField
          key={field.name}
          label={field.label}
          required={field.required}
          value={value}
          onChange={val => handleFieldChange(field.name, val)}
        />
      );
    }
    if (field.type === 'textarea') {
      return (
        <TextareaField
          key={field.name}
          label={field.label}
          required={field.required}
          value={value}
          onChange={val => handleFieldChange(field.name, val)}
        />
      );
    }
    if (field.type === 'html') {
      return (
        <HtmlField
          key={field.name}
          label={field.label}
          required={field.required}
          value={value}
          onChange={val => handleFieldChange(field.name, val)}
        />
      );
    }
    if (field.type === 'media') {
      return (
        <MediaField
          key={field.name}
          label={field.label}
          required={field.required}
          value={value}
          uploading={uploading}
          onUpload={file => handleFileUpload(file, field.name)}
          onRemove={() => handleFieldChange(field.name, null)}
        />
      );
    }
    if (field.type === 'repeatable') {
      const items = slide[field.name] || [];
      return (
        <RepeatableField
          key={field.name}
          label={field.label}
          required={field.required}
          items={items}
          fields={field.fields || []}
          onAdd={() => addRepeatableItem(field.name, field.fields || [])}
          onRemove={index => removeRepeatableItem(field.name, index)}
          onChange={(index, subFieldName, val) => updateRepeatableItem(field.name, index, subFieldName, val)}
        />
      );
    }
    return null;
  };

  if (!template) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center text-gray-500">
          Template não encontrado para o componente: {slide.__component}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
        <p className="text-sm text-gray-500">{template.id}</p>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        {template.fields.map(renderField)}
      </div>
    </div>
  );
}