"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FieldConfig } from "./types";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

function FormFieldRenderer({ field }: { field: FieldConfig }) {
  const { control } = useFormContext();

  return (
    <div className="basis-[30%]">
      <FormField
        control={control}
        name={field.name}
        render={({ field: controllerField }) => (
          <FormItem className="">
            <FormLabel className="inline h-[20px] text-sm font-medium text-gray-700 m-0 p-0">
              <span>{field.label}</span>
            </FormLabel>
            <FormControl>
              {field.type === "select" ? (
                <Select
                  onValueChange={controllerField.onChange}
                  defaultValue={controllerField.value}
                >
                  <SelectTrigger className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder={field.placeholder || "Select"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border rounded shadow-lg">
                    {field.options?.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <Textarea
                  {...controllerField}
                  placeholder={field.placeholder}
                  id={field.name}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                />
              ) : (
                <Input
                  {...controllerField}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  id={field.name}
                  className="w-[220px] h-[48px] rounded-[6px] border-[1.25px] border-[#465FFF] shadow-[0_0_4px_0_#415AFB] "
                />
              )}
            </FormControl>
            <FormMessage className="text-red-500 text-xs mt-1" />
          </FormItem>
        )}
      />
    </div>
  );
}

export default FormFieldRenderer;
