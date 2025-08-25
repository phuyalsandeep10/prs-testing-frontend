"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableCountrySelect } from "@/components/ui/searchable-country-select";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useEffect } from "react";
import Update from "@/components/global-components/Update";
import defaultPhoto from "@/app/assets/carousal3.png";
import { useProfileManagement } from "@/hooks/useProfile";
import { useAuth } from "@/stores";
import { User } from "@/lib/types/roles";

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  address: z.string().min(1, "Address is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AccountForm() {
  const { user } = useAuth();
  const { 
    profile, 
    isLoading, 
    updateProfile, 
    isUpdating, 
    fetchError, 
    isFetchError, 
    updateError, 
    isUpdateError,
    isUpdateSuccess,
    resetUpdate,
    refetch
  } = useProfileManagement();
  const [fileName, setFileName] = useState("Profile.Pic.jpg");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+977");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phoneNumber: "",
      address: "",
    },
  });

  // Load profile data when available and reset form
  useEffect(() => {
    if (profile) {
      console.log('Profile data loaded:', profile); // Debug log
      
      // Force form reset with new data
      let phoneNumber = profile.phoneNumber || profile.contact_number || "";
      
      // Handle phone number extraction (remove country code prefix if it exists)
      if (phoneNumber && phoneNumber.includes('-')) {
        const parts = phoneNumber.split('-');
        if (parts.length >= 2) {
          // Extract the country code and phone number
          setSelectedCountryCode(parts[0]);
          phoneNumber = parts.slice(1).join('-'); // Join remaining parts in case of multiple dashes
        }
      }
      
      const formData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phoneNumber: phoneNumber,
        address: profile.address || "",
      };
      
      console.log('Setting form values:', formData); // Debug log
      console.log('Address value specifically:', formData.address); // Debug address
      
      // Reset form with new values
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key as keyof typeof formData, value);
        console.log(`Set ${key} = ${value}`); // Debug each field
      });
      
      // Set avatar if available and no local file is selected
      const avatarUrl = profile.avatar || (profile as any)?.profile?.profile_picture;
      if (avatarUrl && !selectedFile) {
        console.log('Setting avatar from profile:', avatarUrl);
        setPhotoURL(avatarUrl);
      }
    }
  }, [profile, setValue, selectedFile]);

  // Force form reload when profile is successfully updated
  useEffect(() => {
    if (isUpdateSuccess && profile) {
      console.log('Success! Reloading form with updated profile:', profile); // Debug log
      
      // Handle phone number extraction for success state
      let phoneNumber = profile.phoneNumber || profile.contact_number || "";
      if (phoneNumber && phoneNumber.includes('-')) {
        const parts = phoneNumber.split('-');
        if (parts.length >= 2) {
          setSelectedCountryCode(parts[0]);
          phoneNumber = parts.slice(1).join('-');
        }
      }
      
      setValue("first_name", profile.first_name || "");
      setValue("last_name", profile.last_name || "");
      setValue("email", profile.email || "");
      setValue("phoneNumber", phoneNumber);
      setValue("address", profile.address || "");
      
      // Update avatar after successful update
      const avatarUrl = profile.avatar || (profile as any)?.profile?.profile_picture;
      if (avatarUrl) {
        console.log('Setting avatar URL from profile:', avatarUrl);
        setPhotoURL(avatarUrl);
        setFileName("Profile.Pic.jpg"); // Reset filename
      }
      
      // Clear selected file after successful update
      setSelectedFile(null);
    }
  }, [isUpdateSuccess, profile, setValue]);

  // Handle success state
  useEffect(() => {
    if (isUpdateSuccess) {
      // Force a fresh fetch of profile data
      refetch();
      
      // Reset the success state after 3 seconds
      const timer = setTimeout(() => {
        resetUpdate();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isUpdateSuccess, resetUpdate, refetch]);

  // Cleanup URL objects on unmount
  useEffect(() => {
    return () => {
      if (photoURL && photoURL.startsWith('blob:')) {
        URL.revokeObjectURL(photoURL);
      }
    };
  }, [photoURL]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous URL object to prevent memory leaks
      if (photoURL && photoURL.startsWith('blob:')) {
        URL.revokeObjectURL(photoURL);
      }
      
      setFileName(file.name);
      setPhotoURL(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const handleUpdateClick = handleSubmit((data) => {
    setFormData(data);
    setIsUpdateModalOpen(true);
  });

  const handleConfirmUpdate = () => {
    if (formData) {
      const updateData: Partial<User> = { 
        ...formData,
        phoneNumber: formData.phoneNumber?.startsWith(selectedCountryCode) 
          ? formData.phoneNumber 
          : `${selectedCountryCode}-${formData.phoneNumber}`
      };
      
      // Add the selected file to updateData for API client to handle
      if (selectedFile) {
        console.log('Adding selected file to update data:', selectedFile.name, selectedFile.size);
        (updateData as any).avatar = selectedFile;
      }
      
      console.log('Updating profile with data (including file):', updateData);
      updateProfile(updateData);
      setIsUpdateModalOpen(false);
      setFormData(null);
      // Don't clear selectedFile yet - wait for success to reset it
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 font-outfit">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
                  src={photoURL?.startsWith('/media/') 
                    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8001'}${photoURL}` 
                    : photoURL || defaultPhoto}
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
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Account Information
          </h2>
          {isFetchError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                Failed to load profile. Please refresh the page.
              </p>
            </div>
          )}
          {isUpdateError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                Failed to update profile. Please try again.
              </p>
            </div>
          )}
          {isUpdateSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">
                Profile updated successfully! Changes have been saved.
              </p>
            </div>
          )}
          <form onSubmit={handleUpdateClick} className="space-y-6">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4F46E5] mb-2">
                    First Name<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    {...register("first_name")}
                    placeholder="Enter your first name"
                    className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4F46E5] mb-2">
                    Last Name<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    {...register("last_name")}
                    placeholder="Enter your last name"
                    className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4F46E5] mb-2">
                Email<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="example@company.com"
                className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5] bg-gray-50"
                readOnly
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4F46E5] mb-2">
                Phone Number
              </label>
              <div className="flex">
                <SearchableCountrySelect
                  value={selectedCountryCode}
                  onChange={setSelectedCountryCode}
                  disabled={isUpdating}
                  className="w-[150px]"
                />
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="h-[48px] rounded-l-none border-l-0 border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5] rounded-r-[6px]"
                  value={watch("phoneNumber") ?? ""}
                  onChange={(e) => setValue("phoneNumber", e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
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
                value={profile?.role || user?.role || "Unknown"}
                readOnly
                className="h-[48px] bg-gray-50 border-gray-300 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-8 py-2"
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
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
