"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useGoalStore } from "@/store/apiCall/GoalSet";

type PersonalGoalProps = {
  onClose: () => void;
  refreshDashboard: () => void;
};

const SKIP_LIMIT = 2;

const getSkipCount = () => {
  const count = localStorage.getItem("goalSkipCount");
  return count ? parseInt(count, 10) : 0;
};

const incrementSkipCount = () => {
  const current = getSkipCount();
  const updated = current + 1;
  localStorage.setItem("goalSkipCount", updated.toString());
  return updated;
};

// Zod schema to validate goal amount
const goalSchema = z.object({
  goalAmount: z
    .string()
    .regex(/^\d+$/, { message: "Only numbers are allowed" })
    .min(1, { message: "Goal is required" }),
});

const PersonalGoal: React.FC<PersonalGoalProps> = ({
  onClose,
  refreshDashboard,
}) => {
  const [goalAmount, setGoalAmount] = useState("");
  const [hideSkip, setHideSkip] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { sendRequest, loading, error } = useGoalStore();

  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/auth/user/set-sales-target/`;

  useEffect(() => {
    if (getSkipCount() >= SKIP_LIMIT) {
      setHideSkip(true);
    }
  }, []);

  const handleSetGoal = async () => {
    const result = goalSchema.safeParse({ goalAmount });

    if (!result.success) {
      setValidationError(result.error.errors[0].message);
      return;
    }

    setValidationError(null);

    await sendRequest(
      "POST",
      endpoint,
      { sales_target: Number(goalAmount) },
      undefined,
      undefined,
      (res: { message?: string }) => ({
        message: res?.message ?? "Goal set successfully.",
      })
    );

    setGoalAmount("");
    localStorage.removeItem("goalSkipCount");
    refreshDashboard();
    onClose();
  };

  const handleSkip = () => {
    const updatedCount = incrementSkipCount();
    if (updatedCount >= SKIP_LIMIT) {
      setHideSkip(true);
    }
    onClose();
  };

  // Only allow numbers to be typed
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setGoalAmount(value);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border-0 p-8 w-full max-w-md mx-auto">
        <div className="text-center space-y-4 pb-6">
          <h1 className="text-2xl font-semibold text-blue-600 leading-tight">
            Welcome Chitra Thapa Magar.
          </h1>
          <p className="text-gray-600 text-base font-medium">
            Let's set your personal goal for this month
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label
              htmlFor="goal-amount"
              className="block text-sm font-medium text-gray-900"
            >
              Enter your Personal Goal for month of June
            </label>
            <input
              id="goal-amount"
              type="text" // Input type is text, but accepts only numbers
              placeholder="Enter Amount"
              value={goalAmount}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
            {validationError && (
              <p className="text-red-500 text-sm font-medium mt-1">
                {validationError}
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium mt-2">
              {error.displayMessage}
            </p>
          )}

          <div className="flex justify-between items-center pt-4">
            {!hideSkip ? (
              <button
                onClick={handleSkip}
                className="text-gray-600 hover:text-gray-800 font-medium text-base"
              >
                Skip
              </button>
            ) : (
              <span className="text-red-500 text-sm font-medium">
                You must set a goal to continue.
              </span>
            )}

            <button
              onClick={handleSetGoal}
              disabled={loading[endpoint]}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg transition-colors duration-200 text-base disabled:opacity-50"
            >
              {loading[endpoint] ? "Setting..." : "Set Goal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalGoal;
