import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/dashboard';
import { Register } from './pages/authentication/register';
import { Login } from './pages/authentication/login';
import { ForgotPassword } from './pages/authentication/forgot-password';
import { DashboardLayout } from './components/common/DashboardLayout';
import { PublicLayout } from './components/common/PublicLayout';
import { LandingPage } from './pages/public/LandingPage';
import { EventList } from './pages/dashboard/events';
import { CreateEvent } from './pages/dashboard/events/create';
import { EventDetails } from './pages/dashboard/events/details';
import { UpdateEvent } from './pages/dashboard/events/update';
import { RegisteredEvents } from './pages/dashboard/registered';
import { CalendarView } from './pages/dashboard/calendar';
import { ProfileSettings } from './pages/dashboard/profile';
import { UsersAndStaff } from './pages/dashboard/users';
import { Reports } from './pages/dashboard/Reports';
import { RootLayout } from './components/common/RootLayout';

export const routes = createBrowserRouter([
  {
    // RootLayout wraps everything so <Toaster /> lives inside the
    // RouterProvider tree and shares React context with all pages.
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <LandingPage />
          }
        ]
      },
      {
        path: "/auth",
        children: [
          {
            path: "register",
            element: <Navigate to="/auth/login" replace />
          },
          {
            path: "login",
            element: <Login />
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />
          }
        ]
      },
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          {
            path: "directories",
            element: <EventList />
          },
          {
            path: "calendar",
            element: <CalendarView />
          },
          {
            path: "registered",
            element: <RegisteredEvents />
          },
          {
            path: "profile",
            element: <ProfileSettings />
          },
          {
            path: "users",
            element: <UsersAndStaff />
          },
          {
            path: "reports",
            element: <Reports />
          },
          {
            path: "directories/create",
            element: <CreateEvent />
          },
          {
            path: "directories/:id",
            element: <EventDetails />
          },
          {
            path: "directories/:id/edit",
            element: <UpdateEvent />
          }
        ]
      }
    ]
  }
]);