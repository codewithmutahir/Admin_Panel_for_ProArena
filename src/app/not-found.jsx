import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-6">
      <h1 className="text-[10rem] font-extrabold text-gray-300">404</h1>
      <h2 className="text-4xl text-center font-bold mt-4">Oops! Page not found</h2>
      <p className="mt-2 text-gray-500 text-center max-w-md">
        The page you are looking for does not exist. It might have been removed
        or you may have typed the URL incorrectly.
      </p>
      <Link href="/">
        <Button className="mt-6 px-6 py-3 bg-red-600 hover:bg-blue-700 text-white rounded-lg shadow-md">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}
