import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

/**
 * RootLayout wraps all routes so that <Toaster /> lives
 * inside the RouterProvider tree and shares the same React
 * context as every page that calls toast().
 */
export const RootLayout = () => {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
};
