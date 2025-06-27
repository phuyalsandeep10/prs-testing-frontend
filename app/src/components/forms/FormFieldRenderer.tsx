"use client";

import { useFormContext, ControllerRenderProps, FieldValues } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type FieldConfig = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

interface FormFieldRendererProps {
  field: FieldConfig;
}

function FormFieldRenderer({ field }: FormFieldRendererProps) {
  const { control } = useFormContext();

  const renderField = (rhfField: ControllerRenderProps<FieldValues, string>) => {
    switch (field.type) {
      case "select":
        return (
          <Select onValueChange={rhfField.onChange} defaultValue={rhfField.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "textarea":
        return (
          <Textarea placeholder={field.placeholder} {...rhfField} />
        );
      default:
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            {...rhfField}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={field.name}
      render={({ field: rhfField }) => (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>{renderField(rhfField)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormFieldRenderer;
