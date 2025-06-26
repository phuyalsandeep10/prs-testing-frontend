import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import image from "@/app/assets/carousal3.png";
import { Separator } from "@/components/ui/separator";
import SpandIcon from "@/components/svg/SpandIcon";

interface TeamMember {
  id: string;
  name: string;
  img: string;
  avatar?: string;
}

interface CompanyInformationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Carlo Johnson",
    img: image.src,
    avatar: "/api/placeholder/32/32",
  },
  {
    id: "2",
    name: "Yubesh Parsad Koirala",
    img: image.src,
    avatar: "/api/placeholder/32/32",
  },
  {
    id: "3",
    name: "Sandesh Dhungana",
    img: image.src,
    avatar: "/api/placeholder/32/32",
  },
  {
    id: "4",
    name: "Aashish Bhattarai",
    img: image.src,
    avatar: "/api/placeholder/32/32",
  },
  {
    id: "5",
    name: "Bishal Karki",
    img: image.src,
    avatar: "/api/placeholder/32/32",
  },
  {
    id: "6",
    name: "Ritesh Thapa",
    img: image.src,
    avatar: "/api/placeholder/32/32",
  },
];

export function CompanyInformation({
  isOpen,
  onOpenChange,
}: CompanyInformationProps) {
  const [showAllMembers, setShowAllMembers] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[320px] max-h-[423px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span className="text-xl font-bold text-blue-600">Apple Inc.</span>
          </DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none p-0">
          <CardContent className="pb-[20px] p-0 pt-[5px]">
            {/* Contact Info */}
            <div className="flex gap-3">
              <div className="text-gray-600">
                <span className="text-sm">info@appleinc.com</span>
              </div>
              <div className="text-gray-600">
                <span className="text-sm">+977 - 9876543210</span>
              </div>
            </div>

            {/* Company Details */}
            <div className="pt-5">
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-semibold">Status:</p>
                <p className="text-sm font-normal text-gray-500">Clear</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm font-semibold">Active Date:</p>
                <p className="text-sm font-normal text-gray-500">
                  March 09, 2024
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm font-semibold">Address:</p>
                <p className="text-sm font-normal text-gray-500">
                  California, USA
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm font-semibold">No. of Projects:</p>
                <p className="text-sm font-normal text-gray-500">2</p>
              </div>
            </div>

            <Separator className="my-5 w-full border-[1px] border-gray-200" />

            {/* Scrollable Team Section */}
            <div className="h-[140px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-md">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    Team Members
                  </h3>
                  {teamMembers.length > 4 && (
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer"
                      onClick={() => setShowAllMembers((prev) => !prev)}
                    >
                      <SpandIcon />
                    </Badge>
                  )}
                </div>

                <div className="mt-3 transition-all duration-300">
                  {(showAllMembers ? teamMembers : teamMembers.slice(0, 3)).map(
                    (member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 p-1 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                      >
                        <Avatar className="w-6 h-6 border-2 border-white shadow-sm">
                          <AvatarImage src={member.img} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-normal font-outfit text-gray-800 text-sm">
                          {member.name}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
