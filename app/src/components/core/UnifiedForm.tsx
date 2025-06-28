"use client";

import * as React from "react";
import { useForm, Controller, FieldValues, Path, PathValue, DefaultValues } from "react-hook-form";
import { z, ZodSchema, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Icons
import { 
  Eye, 
  EyeOff, 
  Calendar, 
  Upload, 
  X,
  Plus,
  Minus,
  Save,
  RotateCcw,
  Loader2
} from "lucide-react";

// ==================== TYPES ====================
export type FieldType = 
  | 'text'
  | 'email' 
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'date'
  | 'file'
  | 'custom';

export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface BaseFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  // Validation
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | boolean;
  };
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  options: FieldOption[];
  multiple?: boolean;
}

export interface RadioFieldConfig extends BaseFieldConfig {
  type: 'radio';
  options: FieldOption[];
}

export interface FileFieldConfig extends BaseFieldConfig {
  type: 'file';
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
}

export interface CustomFieldConfig extends BaseFieldConfig {
  type: 'custom';
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

export type FieldConfig = 
  | BaseFieldConfig
  | SelectFieldConfig
  | RadioFieldConfig
  | FileFieldConfig
  | CustomFieldConfig;

export interface FormSection {
  title: string;
  description?: string;
  fields: FieldConfig[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface FormLayout {
  type: 'vertical' | 'horizontal' | 'grid' | 'sections';
  columns?: number;
  spacing?: 'sm' | 'md' | 'lg';
  sections?: FormSection[];
}

export interface FormStyling {
  variant?: 'default' | 'minimal' | 'professional' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export interface FormActions {
  submit?: {
    text?: string;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  };
  reset?: {
    text?: string;
    show?: boolean;
  };
  cancel?: {
    text?: string;
    show?: boolean;
    onClick?: () => void;
  };
  custom?: Array<{
    text: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
    disabled?: boolean;
  }>;
}

export interface UnifiedFormProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  fields: FieldConfig[];
  layout?: FormLayout;
  styling?: FormStyling;
  actions?: FormActions;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onChange?: (data: Partial<T>) => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

// ==================== DEFAULT CONFIGURATIONS ====================
const defaultLayout: FormLayout = {
  type: 'vertical',
  spacing: 'md',
};

const defaultStyling: FormStyling = {
  variant: 'default',
  size: 'md',
  theme: 'light',
};

const defaultActions: FormActions = {
  submit: {
    text: 'Submit',
  },
  reset: {
    text: 'Reset',
    show: true,
  },
};

// ==================== STYLING VARIANTS ====================
const getFormStyles = (styling: FormStyling) => {
  const variants = {
    default: {
      container: "space-y-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm",
      field: "space-y-2",
      label: "text-sm font-medium text-gray-700",
      input: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      error: "text-sm text-red-600",
      description: "text-sm text-gray-500",
    },
    minimal: {
      container: "space-y-4",
      field: "space-y-1",
      label: "text-sm text-gray-600",
      input: "w-full px-2 py-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent",
      error: "text-xs text-red-500",
      description: "text-xs text-gray-400",
    },
    professional: {
      container: "space-y-8 p-8 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg",
      field: "space-y-3",
      label: "text-sm font-semibold text-gray-800 uppercase tracking-wide",
      input: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200",
      error: "text-sm text-red-600 font-medium",
      description: "text-sm text-gray-600",
    },
    compact: {
      container: "space-y-3 p-4 bg-white border border-gray-200 rounded",
      field: "space-y-1",
      label: "text-xs font-medium text-gray-600",
      input: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400",
      error: "text-xs text-red-500",
      description: "text-xs text-gray-400",
    },
  };

  return variants[styling.variant || 'default'];
};

// ==================== FIELD COMPONENTS ====================
interface FieldRendererProps {
  field: FieldConfig;
  control: any;
  styles: any;
  disabled?: boolean;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, control, styles, disabled }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const renderField = (onChange: any, value: any, error: any) => {
    const commonProps = {
      disabled: disabled || field.disabled,
      className: cn(styles.input, field.className),
      placeholder: field.placeholder,
    };

    switch (field.type) {
      case 'password':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
          />
        );

      case 'select':
        const selectField = field as SelectFieldConfig;
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={commonProps.className}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {selectField.options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={onChange}
              disabled={commonProps.disabled}
            />
            <Label className="text-sm font-normal">{field.label}</Label>
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value || false}
              onCheckedChange={onChange}
              disabled={commonProps.disabled}
            />
            <Label className="text-sm font-normal">{field.label}</Label>
          </div>
        );

      case 'radio':
        const radioField = field as RadioFieldConfig;
        return (
          <div className="space-y-2">
            {radioField.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  disabled={commonProps.disabled || option.disabled}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <Label 
                  htmlFor={`${field.name}-${option.value}`}
                  className="text-sm font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              {...commonProps}
              type="file"
              onChange={(e) => onChange(e.target.files)}
              accept={(field as FileFieldConfig).accept}
              multiple={(field as FileFieldConfig).multiple}
            />
            {value && (
              <div className="text-sm text-gray-600">
                {Array.from(value).map((file: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = Array.from(value).filter((_, i) => i !== index);
                        onChange(newFiles.length > 0 ? newFiles : null);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type="date"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'custom':
        const customField = field as CustomFieldConfig;
        const CustomComponent = customField.component;
        return (
          <CustomComponent
            value={value}
            onChange={onChange}
            error={error}
            {...customField.props}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={field.name}
      render={({ field: controllerField, fieldState }) => (
        <FormItem className={styles.field}>
          {field.type !== 'checkbox' && field.type !== 'switch' && (
            <FormLabel className={styles.label}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            {renderField(
              controllerField.onChange,
              controllerField.value,
              fieldState.error
            )}
          </FormControl>
          {field.description && (
            <FormDescription className={styles.description}>
              {field.description}
            </FormDescription>
          )}
          <FormMessage className={styles.error} />
        </FormItem>
      )}
    />
  );
};

// ==================== MAIN COMPONENT ====================
export function UnifiedForm<T extends FieldValues>({
  schema,
  fields,
  layout = defaultLayout,
  styling = defaultStyling,
  actions = defaultActions,
  defaultValues,
  onSubmit,
  onChange,
  className,
  loading = false,
  disabled = false,
}: UnifiedFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const styles = getFormStyles(styling);

  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as DefaultValues<T>,
    mode: 'onChange',
  });

  const { handleSubmit, reset, watch, control, formState } = form;

  // Watch form changes
  const watchedValues = watch();
  React.useEffect(() => {
    if (onChange) {
      onChange(watchedValues);
    }
  }, [watchedValues, onChange]);

  const onSubmitHandler = async (data: T) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset(defaultValues);
  };

  const renderFields = () => {
    if (layout.type === 'sections' && layout.sections) {
      return layout.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            )}
          </div>
          <div className={getFieldsLayoutClass()}>
            {section.fields.map((field, fieldIndex) => (
              <FieldRenderer
                key={`${sectionIndex}-${fieldIndex}`}
                field={field}
                control={control}
                styles={styles}
                disabled={disabled || loading}
              />
            ))}
          </div>
        </div>
      ));
    }

    return (
      <div className={getFieldsLayoutClass()}>
        {fields.map((field, index) => (
          <FieldRenderer
            key={index}
            field={field}
            control={control}
            styles={styles}
            disabled={disabled || loading}
          />
        ))}
      </div>
    );
  };

  const getFieldsLayoutClass = () => {
    switch (layout.type) {
      case 'horizontal':
        return 'flex flex-wrap gap-4';
      case 'grid':
        return `grid grid-cols-1 md:grid-cols-${layout.columns || 2} gap-4`;
      default:
        return 'space-y-4';
    }
  };

  const getSpacingClass = () => {
    const spacingMap = {
      sm: 'space-y-3',
      md: 'space-y-4',
      lg: 'space-y-6',
    };
    return spacingMap[layout.spacing || 'md'];
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={handleSubmit(onSubmitHandler)} 
        className={cn(styles.container, getSpacingClass(), className)}
      >
        {renderFields()}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          {actions.cancel?.show && (
            <Button
              type="button"
              variant="outline"
              onClick={actions.cancel.onClick}
              disabled={disabled || loading || isSubmitting}
            >
              {actions.cancel.text || 'Cancel'}
            </Button>
          )}
          
          {actions.reset?.show && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={disabled || loading || isSubmitting}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {actions.reset.text || 'Reset'}
            </Button>
          )}

          {actions.custom?.map((action, index) => (
            <Button
              key={index}
              type="button"
              variant={action.variant || 'outline'}
              onClick={action.onClick}
              disabled={disabled || loading || isSubmitting || action.disabled}
            >
              {action.text}
            </Button>
          ))}

          <Button
            type="submit"
            variant={actions.submit?.variant || 'default'}
            disabled={disabled || loading || isSubmitting || actions.submit?.disabled || !formState.isValid}
          >
            {(loading || isSubmitting) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {actions.submit?.text || 'Submit'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 