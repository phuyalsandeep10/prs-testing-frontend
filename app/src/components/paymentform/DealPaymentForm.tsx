import React, { useState, useRef, useEffect } from "react";
import DynamicForm from "./DynamicForm";
import { z } from "zod";
import closeicon from "@/assets/icons/close icon.svg";
import Image from "next/image";
import gsap from "gsap";

const DealPaymentForm = ({ togglePaymentForm, setTogglePaymentForm }) => {
  // toggling payment form footer button
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create a ref to the paymentt form for animation
  const formRef = useRef(null);

  // Payment Form Animation functionality
  // This effect runs when togglePaymentForm changes
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;

    if (togglePaymentForm) {
      gsap.fromTo(
        el,
        { x: "100%", opacity: 0, display: "none" },
        {
          x: "0%",
          opacity: 1,
          display: "block",
          duration: 1,
          ease: "power2.out",
        }
      );
    } else {
      gsap.to(el, {
        x: "100%",
        opacity: 0,
        duration: 1,
        ease: "power2.in",
        onComplete: () => {
          el.style.display = "none";
        },
      });
    }
  }, [togglePaymentForm]);

  // defined payment form schema
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

  // defined payment form fields values and label
  const fields = [
    {
      name: "Payment Date*",
      label: "Payment Date*",
      type: "text",
      placeholder: "19 - 08 - 2002",
    },
    {
      name: "Received Amount*",
      label: "Received Amount*",
      type: "text",
      placeholder: "john@$150,000",
    },
    {
      name: "Cheque No.*",
      label: "Cheque No.*",
      type: "text",
      placeholder: "121345235",
    },
    {
      name: "Attach Reciept*",
      label: "Attach Reciept*",
      type: "file",
      placeholder: "Tell us more",
    },
    {
      name: "Payment Type*",
      label: "Payment Type*",
      type: "text",
      placeholder: "Tell us more",
    },
    {
      name: "Remarks*",
      label: "Remarks*",
      type: "text",
      placeholder: "Tell us more",
    },
  ];
  return (
    <div
      ref={formRef}
      className="absolute z-50 left-0 top-0 rounded-[6px] bg-gradient-to-br from-black/20 to-black/30 w-screen h-screen "
      style={{ display: togglePaymentForm ? "flex" : "none" }}
    >
      <div className="w-[50%] z-50 h-full flex flex-col absolute right-0 bg-white justify-between ">
        <div className="px-[40px] pb-[12px]">
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-[20px] leading-[28px] text-[#465FFF] pt-[24px] pb-[34px]">
              ADD PAYMENT
            </h1>
            <span
              onClick={() => setTogglePaymentForm((prev) => !prev)}
              className="cursor-pointer"
            >
              <Image src={closeicon} alt="close" />
            </span>
          </div>
          <DynamicForm
            schema={schema}
            fields={fields}
            onSubmit={(data) => console.log("📨 Contact Form:", data)}
            className="flex flex-wrap w-full pb-[34px] pt-[6px] justify-between gap-y-[34px]"
          />
        </div>
        <div className="inline-block w-full bg-[linear-gradient(90deg,_#0C29E3_0%,_#929FF4_56.65%,_#C6CDFA_100%)] py-3.5 rounded-b-[6px]">
          <div className="flex flex-row-reverse pr-[38px] gap-7">
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
      </div>
    </div>
  );
};

export default DealPaymentForm;
