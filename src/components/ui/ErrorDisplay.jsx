import React from "react";
import { AlertCircle } from "lucide-react";

export const ErrorDisplay = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
      <AlertCircle className="w-5 h-5 mr-2" />
      <span>{message}</span>
    </div>
  );
};
