"use client";

import { useForm } from "react-hook-form";
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
  defaultValues?: Partial<z.infer<ZodObject<T>>>;
  className?: string; // 🔧 Add this line
}

function DynamicForm<T extends ZodRawShape>({
  schema,
  fields,
  onSubmit,
  defaultValues = {},
  className = "",
}: DynamicFormProps<T>) {
  const form = useForm<z.infer<ZodObject<T>>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className={className}>
        {fields.map((field) => (
          <FormFieldRenderer key={field.name} field={field} />
        ))}
        {/* <Button type="submit">Submit</Button> */}
      </form>
    </Form>
  );
}

export default DynamicForm;
