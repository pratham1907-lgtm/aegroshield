"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Safely capture global root error in Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl border border-red-100">
            🚨
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h1>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            A critical system exception was encountered. Our automated monitoring has recorded this event.
          </p>
          <button
            onClick={() => reset()}
            className="w-full px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
