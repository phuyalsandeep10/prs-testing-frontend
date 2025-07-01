"use client";

import { useForm, DefaultValues } from "react-hook-form";
import { z, ZodObject, ZodRawShape } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import FormFieldRenderer from "./FormFieldRenderer";

import { FieldConfig } from "./types";

interface DynamicFormProps<T extends ZodRawShape> {
  schema: ZodObject<T>;
  fields: FieldConfig[];
  onSubmit: (data: z.infer<ZodObject<T>>) => void;
  defaultValues?: DefaultValues<z.infer<ZodObject<T>>>;
  className?: string;
}

function DynamicForm<T extends ZodRawShape>({
  schema,
  fields,
  onSubmit,
  defaultValues = {} as DefaultValues<z.infer<ZodObject<T>>>,
  className = "",
}: DynamicFormProps<T>) {
  const form = useForm<z.infer<ZodObject<T>>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<z.infer<ZodObject<T>>>,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {fields.map((field) => (
          <FormFieldRenderer key={field.name} field={field} />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export default DynamicForm;
