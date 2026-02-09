import React from "react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ErrorBoundary: React.FC = () => {
  const error: any = useRouteError();

  const handleReload = () => {
    window.location.reload();
  };

  let errorMessage = "An unexpected error occurred.";
  let errorCode = "UNKNOWN_ERROR";

  if (isRouteErrorResponse(error)) {
    errorMessage =
      error.statusText ||
      error.data?.message ||
      "Page not found or access denied.";
    errorCode = String(error.status);
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorCode = error.name;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans text-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-2xl  text-gray-900 mb-2">
          Something went wrong
        </h1>

        <p className="text-gray-500 mb-6 leading-relaxed">
          Sorry, we ran into an issue. Please try refreshing the page.
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left overflow-auto max-h-40">
          <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
            {errorMessage}
          </p>
        </div>

        <button
          onClick={handleReload}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-100 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Application
        </button>
      </div>

      <p className="mt-8 text-xs text-gray-400">Error Code: {errorCode}</p>
    </div>
  );
};

export default ErrorBoundary;
