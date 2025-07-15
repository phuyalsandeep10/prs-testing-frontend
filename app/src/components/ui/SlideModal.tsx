"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import CloseBtn from "@/assets/icons/close-blue.svg";
import Image from "next/image";

interface SlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

const SlideModal: React.FC<SlideModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = "md",
  showCloseButton = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger animation after render
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getWidthClass = () => {
    switch (width) {
      case "sm":
        return "w-96";
      case "md":
        return "w-[32rem]";
      case "lg":
        return "w-[48rem]";
      case "xl":
        return "w-[64rem]";
      case "full":
        return "w-full max-w-7xl";
      default:
        return "w-[32rem]";
    }
  };

  if (!isVisible || typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999]"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
      }}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          isAnimating ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={handleBackdropClick}
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Modal Panel */}
      <div
        className="fixed inset-y-0 right-0 flex max-w-full z-[100000]"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          right: 0,
          zIndex: 100000,
        }}
      >
        <div
          className={`relative ${getWidthClass()} transform transition-transform duration-300 ease-in-out ${
            isAnimating ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#DADFFF]">
                {title && (
                  <h2 className="text-xl font-semibold text-[#037A48]">
                    {title}   
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={handleClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors ml-auto"
                  >
                    <Image
                      className="h-5 w-5"
                      src={CloseBtn}
                      alt="close-btn"
                    ></Image>
                    {/* <X  /> */}
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SlideModal;
