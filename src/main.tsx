import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import routes from "./routes/routes";

import { Suspense } from "react";

// Define the router configuration
const router = createBrowserRouter(routes);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
createRoot(rootElement).render(
  <>
    <Provider store={store}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen w-screen bg-[#6bbd45]">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
  </>,
);
