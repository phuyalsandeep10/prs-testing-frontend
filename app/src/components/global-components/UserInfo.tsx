import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import image from "@/app/assets/carousal3.png";

interface UserProfileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    name: string;
    email: string;
    contactNo: string;
    img: string;
    assignedTeam: string;
    avatar?: string;
    isVerified?: boolean;
    remarks?: string;
  };
}

// Default user data
const defaultUser = {
  name: "Yubesh Prasad Koirala",
  email: "yubeshkoirala@gmail.com",
  contactNo: "9876543210",
  img: image.src,
  assignedTeam: "Design Wizards",
  avatar: "/api/placeholder/80/80",
  isVerified: true,
  remarks:
    "User has undergone team changes from Sea Warriors to Design Wizards.",
};

// Reusable Modal Component
export function UserProfile({
  isOpen,
  onOpenChange,
  user = defaultUser,
}: UserProfileModalProps) {
  // const getInitials = (name: string) => {
  //   return name
  //     .split(" ")
  //     .map((n) => n[0])
  //     .join("")
  //     .toUpperCase();
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[300px] h-[450px] mx-auto p-0 gap-0">
        <DialogTitle className="sr-only">User Profile</DialogTitle>
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="flex flex-col items-center pt-8 pb-6 px-6">
            <div className="relative mb-2">
              <Avatar className="w-16 h-16 border-2 border-white shadow-sm object-cover">
                <AvatarImage src={defaultUser.img} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                  {defaultUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-blue-600 mb-2">
                {user.name}
              </h2>

              {user.isVerified && (
                <div className="flex items-center justify-center gap-1 mb-5">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex justify-center">
            <div className="px-6 ">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex gap-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Email:
                    </p>
                    <p className="text-sm font-normal text-gray-600 ">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex gap-1 ml-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Contact No:
                    </p>
                    <p className="text-sm font-normal text-gray-600 ">
                      {user.contactNo}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-5">
                  <div className="min-w-0 flex gap-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Assigned team:
                    </p>
                    <p className="text-sm font-normal text-gray-600 ">
                      {user.assignedTeam}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="mt-5" />
          {user.remarks && (
            <>
              {/* Remarks Section */}
              <div className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-black underline underline-offset-2 mb-2 flex justify-center">
                      Remarks
                    </p>
                    <p className="text-sm text-[#6C6C6C] leading-relaxed text-center w-[253px]">
                      {user.remarks}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
