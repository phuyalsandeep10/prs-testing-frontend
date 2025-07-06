import React, { useState } from "react";

type PersonalGoalProps = {
  onClose: () => void;
};

const PersonalGoal: React.FC<PersonalGoalProps> = ({ onClose }) => {
  const [goalAmount, setGoalAmount] = useState("");

  const handleSetGoal = () => {
    if (goalAmount.trim()) {
      console.log("Goal set:", goalAmount);
      setGoalAmount("");
      onClose();
    }
  };

  const handleSkip = () => {
    console.log("Goal setting skipped");
    onClose();
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
              Enter your Personal Goal for month of, June
            </label>
            <input
              id="goal-amount"
              type="text"
              placeholder="Enter Amount"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handleSkip}
              className="text-gray-600 hover:text-gray-800 font-medium text-base px-0 hover:bg-transparent bg-transparent border-0"
            >
              Skip
            </button>
            <button
              onClick={handleSetGoal}
              className="bg-blue-600 hover.bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg transition-colors duration-200 text-base"
            >
              Set Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalGoal;
