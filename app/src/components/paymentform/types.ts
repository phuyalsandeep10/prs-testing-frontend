export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select";
  placeholder?: string;
  options?: { label: string; value: string }[]; // for select, radio, etc.
};
