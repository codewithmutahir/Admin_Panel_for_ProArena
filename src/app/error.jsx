"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-gray-900">
      <h1 className="text-[8rem] font-extrabold text-red-400 animate-pulse">!</h1>
      <h2 className="text-4xl font-bold mt-4">Something went wrong</h2>
      <p className="mt-2 text-center text-gray-500 max-w-md">
        {error?.message || "An unexpected error occurred. Please try again later."}
      </p>
      <Button
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
        onClick={() => reset()}
      >
        Try Again
      </Button>
      
    </div>
  );
}
