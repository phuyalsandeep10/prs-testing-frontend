import React, {useState} from "react";
import DynamicForm from "../forms/DynamicForm";
import { FieldConfig } from "./types";
import { z } from "zod";
import closeicon from "@/assets/icons/close icon.svg";
import Image from "next/image";

interface DealPaymentFormProps {
  togglePaymentForm?: boolean;
  setTogglePaymentForm?: (value: boolean) => void;
}

const DealPaymentForm: React.FC<DealPaymentFormProps> = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = z.object({
    PaymentDate: z.string().min(1, "First name is required"),
    ReceivedAmount: z.string().min(1, "First name is required"),
    ChequeNo: z.string().min(1, "First name is required"),
    PaymentType: z.string().min(1, "First name is required"),
    Remarks: z.string().min(1, "First name is required"),
    AttachReciept: z
      .any()
      .refine((files) => files?.length === 1, {
        message: "Upload Receipt is required",
      })
      .refine((files) => files?.[0]?.name.toLowerCase().endsWith(".png"), {
        message: "Only png files are allowed",
      }),
  });

  const fields = [
    {
      name: "Payment Date*",
      label: "Payment Date*",
      type: "text" as const,
      placeholder: "19 - 08 - 2002",
    },
    {
      name: "Received Amount*",
      label: "Received Amount*",
      type: "number" as const,
      placeholder: "john@$150,000",
    },
    {
      name: "Cheque No.*",
      label: "Cheque No.*",
      type: "text" as const,
      placeholder: "121345235",
    },
    {
      name: "Attach Reciept*",
      label: "Attach Reciept*",
      type: "text" as const,
      placeholder: "Tell us more",
    },
    {
      name: "Payment Type*",
      label: "Payment Type*",
      type: "select" as const,
      placeholder: "Tell us more",
    },
    {
      name: "Remarks*",
      label: "Remarks*",
      type: "textarea" as const,
      placeholder: "Tell us more",
    },
  ];
  return (
    <div className="w-[761px]">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-[20px] leading-[28px] text-[#465FFF] pt-[24px] pb-[34px]">
          ADD PAYMENT
        </h1>
        <span>
          <Image src={closeicon} alt="close" />
        </span>
      </div>
      <DynamicForm
        schema={schema}
        fields={fields}
        onSubmit={(data) => console.log("📨 Contact Form:", data)}
        className="flex flex-wrap w-[761px] gap-[36px]"
      />
      <div className="flex justify-end gap-4 mt-3 bg-gradient-to-r from-[#0C29E3] via-[#929FF4] to-[#C6CDFA] p-4 -ml-4 sm:-ml-6 md:-ml-8 lg:-ml-10 -mr-4 sm:-mr-6 md:-mr-6 lg:-mr-6">
        <button
          type="button"
          //   onClick={handleClear}
          className="bg-[#F61818] text-white w-[83px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold"
        >
          Clear
        </button>
        <button
          type="submit"
          //   disabled={isSubmitting}
          className="bg-[#009959] text-white w-[119px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold"
        >
          {isSubmitting ? "Submitting..." : "Save Client"}
        </button>
      </div>
    </div>
  );
};

export default DealPaymentForm;
