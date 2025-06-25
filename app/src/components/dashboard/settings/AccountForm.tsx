"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";

import defaultPhoto from "@/app/assets/carousal3.png";

const formSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email"),
  address: z.string().min(1, "Address is required"),
  role: z.string().min(1, "Role is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AccountForm() {
  const [fileName, setFileName] = useState("Profile.Pic.jpg");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Form Data:", data);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setPhotoURL(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <div className="h-full pl-4 pb-4 font-outfit">
        {/* Upload Section */}
        <div
          className="flex h-[110px] justify-between bg-white rounded items-center pl-8"
          style={{ boxShadow: "-6px 6px 12px rgba(151, 158, 173, 0.3)" }}
        >
          {/* Left section: Image and text */}
          <div className="flex items-center gap-4">
            <div
              onClick={handleImageClick}
              className="cursor-pointer w-[65px] h-[65px] rounded-full overflow-hidden"
            >
              <Image
                src={photoURL || defaultPhoto}
                width={65}
                height={65}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <p className="font-medium font-outfit">Upload a New Photo</p>
              <p className="text-sm text-gray-500">{fileName}</p>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Right section: Button */}
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="bg-[#465FFF] text-white"
          >
            Update
          </Button>
        </div>

        {/* Form Section */}
        <div
          className="bg-white rounded mt-8 h-auto pl-8 pt-2"
          style={{ boxShadow: "-6px 6px 12px rgba(151, 158, 173, 0.3)" }}
        >
          <h2 className="font-semibold text-xl mb-4 pt-6">
            Change Your Information here
          </h2>
          <form className="space-y-3 pr-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block font-medium mb-2 text-[13px]">
                Full Name<span className="text-red-600 text-[20px]">*</span>
              </label>
              <Input
                {...register("fullName")}
                placeholder="Name"
                className="h-[48px]"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-2 text-[13px]">
                Email<span className="text-red-600 text-[20px]">*</span>
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="Example123@gmail.com"
                className="h-[48px]"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-2 text-[13px]">
                Address<span className="text-red-600 text-[20px]">*</span>
              </label>
              <Input
                {...register("address")}
                placeholder="Itahari, Aanamnagar, Sunsari, Nepal"
                className="h-[48px]"
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="">
              <label className="block font-medium mb-2 text-[13px]">
                Role<span className="text-red-600 text-[20px]">*</span>
              </label>
              <Input
                {...register("role")}
                placeholder="Verifier"
                className="h-[48px]"
              />
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
