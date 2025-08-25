"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import img from "@/assets/photo/saleDashboard.png";
import avatar35 from "@/assets/photo/35.png";
import avatar55 from "@/assets/photo/55.png";
import avatar75 from "@/assets/photo/75.png";
import avatar100 from "@/assets/photo/100.png";
import box from "@/assets/photo/box.png";
import box35 from "@/assets/photo/box35.png";
import box55 from "@/assets/photo/box55.png";
import box75 from "@/assets/photo/box75.png";
import box100 from "@/assets/photo/box100.png";
import { useMemo } from "react";
import { useDashboard } from "@/hooks/api";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import styles from "./Acheve.module.css";

const Acheve = () => {
  const { data, isLoading, error, refetch } = useDashboard();
  
  console.log("Achievement Component Data:", { data, isLoading, error });

  // Memoize derived data to avoid recalculating on every render
  const { currentAmount, targetAmount, percentage } = useMemo(() => {
    // Try both field names for compatibility
    const current = parseFloat(data?.sales_progress?.achieved || "0") || 0;
    const target = parseFloat(data?.sales_progress?.target || "1") || 1;
    const percent = (current / target) * 100;
    return {
      currentAmount: current,
      targetAmount: target,
      percentage: percent,
    };
  }, [data?.sales_progress]);

  // Memoize UI configuration
  const {
    avatarImage,
    boxImage,
    message,
    bgColor,
    textColor,
    leftAvatarRotation,
  } = useMemo(() => {
    let avatar = img;
    let boxImg = box;
    let msg = "Just getting started! You can do it!";
    let bg = "#E0F2F7";
    let text = "#31323A";
    let rotation = "rotate-12";

    if (percentage >= 100) {
      avatar = avatar100;
      boxImg = box100;
      msg = "Well done!";
      bg = "#2A9ACD";
      text = "#FFFFFF";
      rotation = "rotate-12";
    } else if (percentage >= 75) {
      avatar = avatar75;
      boxImg = box75;
      msg = "Almost complete! So close!";
      bg = "#57B9D6";
      text = "#31323A";
      rotation = "rotate-[-25deg]";
    } else if (percentage >= 55) {
      avatar = avatar55;
      boxImg = box55;
      msg = "Halfway there! You're doing great!";
      bg = "#85CCE0";
      text = "#31323A";
      rotation = "rotate-12";
    } else if (percentage >= 35) {
      avatar = avatar35;
      boxImg = box35;
      msg = "Making progress! Keep going!";
      bg = "#B3E0ED";
      text = "#31323A";
      rotation = "rotate-12";
    }

    return {
      avatarImage: avatar,
      boxImage: boxImg,
      message: msg,
      bgColor: bg,
      textColor: text,
      leftAvatarRotation: rotation,
    };
  }, [percentage]);

  if (error) {
    return (
      <ErrorBoundary fallback={<div className="text-red-600">You do not have permission to view this dashboard section.</div>}>
        <Card className="w-full h-[212px] border rounded-lg p-8 flex flex-col items-center justify-center bg-white shadow-md">
          <p className="text-md font-outfit font-medium text-red-500 mb-4">
            Failed to load achievement data
          </p>
          <Button
            variant="outline"
            className="text-sm font-medium font-outfit text-[#465FFF] hover:text-[#465FFF]"
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </Card>
      </ErrorBoundary>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full h-[212px] border rounded-lg p-8 flex justify-center items-center bg-white shadow-md">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#465FFF]"></div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full h-[212px] border rounded-lg p-8 flex justify-center items-center bg-white shadow-md">
        <p className="text-md font-outfit font-medium text-gray-500">
          No data available
        </p>
      </Card>
    );
  }

  return (
    <Card
      className={`relative w-full h-[212px] border rounded-lg pl-8 overflow-hidden shadow-md ${styles.achievement}`}
      style={{ '--achievement-bg-color': bgColor } as React.CSSProperties}
    >
      <div
        className={`absolute left-[-90px] top-[-40px] ${leftAvatarRotation}`}
      >
        <Image
          src={avatarImage}
          alt="Avatar Left"
          width={286}
          height={286}
          className="opacity-60"
        />
      </div>

      <div className="absolute right-[-39px] top-0 flex flex-col items-end">
        <div className="pt-7 pr-20 z-10">
          <Image
            src={avatarImage}
            alt="Avatar Right"
            width={155}
            height={155}
          />
        </div>
        <div className="mt-[-100px] pr-[-10px]">
          <Image src={boxImage} alt="Treasure Box" width={162} height={162} />
        </div>
      </div>

      <div className="flex flex-col justify-start z-10">
        <Button
          variant="outline"
          className="text-sm font-medium font-outfit w-[178px] h-[37px] pb-[12px] text-[#465FFF] hover:text-[#465FFF]"
        >
          Complete task for rewards
        </Button>

        <h2
          className={`text-xl font-outfit font-semibold pb-[31px] ${styles.welcomeMessage}`}
          style={{ '--text-color': textColor } as React.CSSProperties}
        >
          Welcome Message
        </h2>
        <div className="pr-32">
          <div className="bg-white rounded-lg shadow-sm w-full h-[64px] flex flex-col justify-start">
            <p className="text-md font-outfit font-medium text-black px-6 pt-3 mb-[6px] leading-tight">
              {message}
              <span className="float-right font-semibold">
                <span className="text-[#465FFF]">
                  ${currentAmount.toLocaleString()}
                </span>
                <span className="text-gray-500"> / </span>
                <span className="text-black">
                  ${targetAmount.toLocaleString()}
                </span>
              </span>
            </p>
            <div className="px-6 pb-[12px]">
              <div className="relative w-full h-[10px] bg-gray-200 rounded-md overflow-hidden">
                <div
                  className={`h-full ${styles.progressBar}`}
                  style={{ '--progress-width': `${Math.min(percentage, 100)}%` } as React.CSSProperties}
                ></div>

                <div className="absolute inset-0">
                  {percentage < 45 && (
                    <div className={`${styles.progressMarker} ${styles.marker45}`} />
                  )}
                  {percentage < 65 && (
                    <div className={`${styles.progressMarker} ${styles.marker65}`} />
                  )}
                  {percentage < 85 && (
                    <div className={`${styles.progressMarker} ${styles.marker85}`} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Acheve;
