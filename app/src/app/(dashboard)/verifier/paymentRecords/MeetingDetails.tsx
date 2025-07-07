"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import MeetingCard from "@/components/PaymentRecordsTable/MeetingCard";

interface MeetingDetailsData {
  date: string;
  time: string;
  meetingTitle: string;
  personName: string;
  role: string;
  imageUrl: string;
}

const fetchMeetingDetails = async (): Promise<MeetingDetailsData[]> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([
        {
          date: "May 28, 2025",
          time: "10:30 AM",
          meetingTitle: "Meeting with Jane Smith to discuss CRM integration.",
          personName: "Kushal Shrestha",
          role: "Admin",
          imageUrl: "/images/nish-profile.jpg",
        },
        {
          date: "May 29, 2025",
          time: "2:00 PM",
          meetingTitle: "Follow-up with Marketing team",
          personName: "Maya Rai",
          role: "Marketing Lead",
          imageUrl: "/images/maya-profile.jpg",
        },
        {
          date: "May 30, 2025",
          time: "11:00 AM",
          meetingTitle: "Technical sync with DevOps",
          personName: "Anil Thapa",
          role: "DevOps Engineer",
          imageUrl: "/images/anil-profile.jpg",
        },
      ]);
    }, 1500)
  );
};

const MeetingDetails = () => {
  const { data, isLoading, isError } = useQuery<MeetingDetailsData[]>({
    queryKey: ["meetingDetails"],
    queryFn: fetchMeetingDetails,
  });

  const [open, setOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-6 h-6 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="text-center text-red-600">
        Failed to load meeting details.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full space-y-0">
        <Collapsible open={open} onOpenChange={setOpen}>
          {/* First card with icon trigger */}
          <div className="relative">
            <MeetingCard {...data[0]} />

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 p-1 h-6 w-6"
              >
                {open ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* Other cards (collapsible) */}
          <CollapsibleContent>
            {data.slice(1).map((meeting, index) => (
              <div key={index} className="-mt-px">
                <MeetingCard {...meeting} />
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default MeetingDetails;
