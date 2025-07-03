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

const Acheve = () => {
  const currentAmount = 3000;
  const targetAmount = 15000;
  const percentage = (currentAmount / targetAmount) * 100;

  let avatarImage = img;
  let boxImage = box;
  let message = "Just getting started! You can do it!";
  let bgColor = "#E0F2F7";
  let textColor = "#31323A";
  let leftAvatarRotation = "rotate-12";

  if (percentage == 100) {
    avatarImage = avatar100;
    boxImage = box100;
    message = "Well done!";
    bgColor = "#2A9ACD";
    textColor = "#FFFFFF";
    leftAvatarRotation = "rotate-12";
  } else if (percentage >= 75) {
    avatarImage = avatar75;
    boxImage = box75;
    message = "Almost complete! So close!";
    bgColor = "#57B9D6";
    textColor = "#31323A";
    leftAvatarRotation = "rotate-[-25deg]";
  } else if (percentage >= 55) {
    avatarImage = avatar55;
    boxImage = box55;
    message = "Halfway there! You're doing great!";
    bgColor = "#85CCE0";
    textColor = "#31323A";
    leftAvatarRotation = "rotate-12";
  } else if (percentage >= 35) {
    avatarImage = avatar35;
    boxImage = box35;
    message = "Making progress! Keep going!";
    bgColor = "#B3E0ED";
    textColor = "#31323A";
    leftAvatarRotation = "rotate-12";
  }

  return (
    <Card
      className="relative w-full max-w-[800px] h-[212px] border rounded-lg pl-8 overflow-hidden shadow-md"
      style={{ backgroundColor: bgColor }}
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

      {/* Top right avatar + milestone box */}
      <div className="absolute right-[-39px] top-0 flex flex-col items-end">
        {/* Avatar */}
        <div className="pt-7 pr-20 z-10">
          <Image
            src={avatarImage}
            alt="Avatar Right"
            width={155}
            height={155}
          />
        </div>

        {/* Box image */}
        <div className="mt-[-100px] pr-[-10px]">
          <Image src={boxImage} alt="Treasure Box" width={162} height={162} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col justify-start z-10">
        <Button
          variant="outline"
          className="text-sm font-medium font-outfit w-[178px] h-[37px] pb-[12px] text-[#465FFF] hover:text-[#465FFF]"
        >
          Complete task for rewards
        </Button>

        <h2
          className="text-xl font-outfit font-semibold pb-[31px]"
          style={{ color: textColor }}
        >
          Welcome Message.
        </h2>

        <div className="bg-white rounded-lg shadow-sm w-full max-w-[468px] h-[64px] flex flex-col justify-start">
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
                className="h-full"
                style={{
                  width: `${percentage}%`,
                  background:
                    "linear-gradient(to right, #A7D9FF,#7ABFFF,#4D9FFF,#2080FF)",
                }}
              ></div>

              {/* Milestone indicators */}
              <div className="absolute inset-0">
                {percentage < 45 && (
                  <div
                    className="absolute top-0 bottom-0 w-[1px] bg-[#7E7E7E]"
                    style={{ left: "45%" }}
                  />
                )}
                {percentage < 65 && (
                  <div
                    className="absolute top-0 bottom-0 w-[1px] bg-[#7E7E7E]"
                    style={{ left: "65%" }}
                  />
                )}
                {percentage < 85 && (
                  <div
                    className="absolute top-0 bottom-0 w-[1px] bg-[#7E7E7E]"
                    style={{ left: "85%" }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Acheve;
