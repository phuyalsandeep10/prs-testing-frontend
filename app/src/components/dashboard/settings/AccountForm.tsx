"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import Update from "@/components/global-components/Update";
import defaultPhoto from "@/app/assets/carousal3.png";

const formSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email"),
  address: z.string().min(1, "Address is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AccountForm() {
  const [fileName, setFileName] = useState("Profile.Pic.jpg");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

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

  const handleUpdateClick = handleSubmit((data) => {
    setFormData(data);
    setIsUpdateModalOpen(true);
  });

  const handleConfirmUpdate = () => {
    if (formData) {
      console.log("Confirmed Form Data:", formData);
      setIsUpdateModalOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-6 font-outfit">
        {/* Upload Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                onClick={handleImageClick}
                className="cursor-pointer w-[65px] h-[65px] rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#4F46E5] transition-colors"
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
                <h3 className="font-semibold text-gray-900">Upload a New Photo</h3>
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
            <Button
              type="button"
              onClick={handleUpdateClick}
              className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-6 py-2"
            >
              Update
            </Button>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Account Information
          </h2>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#4F46E5] mb-2">
                Full Name<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                {...register("fullName")}
                placeholder="Enter your full name"
                className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4F46E5] mb-2">
                Email<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="example@company.com"
                className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4F46E5] mb-2">
                Address<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                {...register("address")}
                placeholder="Enter your address"
                className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4F46E5] mb-2">
                Role
              </label>
              <Input
                value="Verifier"
                readOnly
                className="h-[48px] bg-gray-50 border-gray-300 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={handleUpdateClick}
                className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-8 py-2"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Update
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        onCancel={() => setIsUpdateModalOpen(false)}
        onLogout={handleConfirmUpdate}
      />
    </>
  );
}
