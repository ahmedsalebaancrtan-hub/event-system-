import { createBrowserRouter } from 'react-router-dom';
import { Dashboard } from './pages/dashboard';
import { Register } from './pages/authentication/register';
import { Login } from './pages/authentication/login';
import { ForgotPassword } from './pages/authentication/forgot-password';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LandingPage } from './pages/public/LandingPage';
import { EventList } from './pages/dashboard/events';
import { CreateEvent } from './pages/dashboard/events/create';
import { EventDetails } from './pages/dashboard/events/details';
import { UpdateEvent } from './pages/dashboard/events/update';
import { RegisteredEvents } from './pages/dashboard/registered';
import { CalendarView } from './pages/dashboard/calendar';
import { ProfileSettings } from './pages/dashboard/profile';
import { UsersAndStaff } from './pages/dashboard/users';
import { RootLayout } from './components/RootLayout';

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
            element: <Register />
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