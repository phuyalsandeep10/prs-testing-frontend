"use client";

import { z, ZodSchema } from "zod";
import { UnifiedForm, FieldConfig } from "@/components/core";
import { FieldValues, DefaultValues } from "react-hook-form";

// Convert legacy field config to new field config
const convertLegacyField = (legacyField: any): FieldConfig => ({
  name: legacyField.name,
  label: legacyField.label,
  type: legacyField.type as any,
  placeholder: legacyField.placeholder,
  required: true, // Default to required, can be overridden
});

interface DynamicFormProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    placeholder?: string;
  }>;
  onSubmit: (data: T) => void;
  defaultValues?: DefaultValues<T>;
  className?: string;
  loading?: boolean;
}

function DynamicForm<T extends FieldValues>({
  schema,
  fields,
  onSubmit,
  defaultValues,
  className,
  loading = false,
}: DynamicFormProps<T>) {
  const convertedFields = fields.map(convertLegacyField);

  return (
    <UnifiedForm
      schema={schema}
      fields={convertedFields}
      layout={{
        type: 'vertical',
        spacing: 'md',
      }}
      styling={{
        variant: 'default',
        size: 'md',
      }}
      actions={{
        submit: {
          text: 'Submit',
          loading,
        },
        reset: {
          text: 'Reset',
          show: true,
        },
      }}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      className={className}
      loading={loading}
    />
  );
}

export default DynamicForm;
