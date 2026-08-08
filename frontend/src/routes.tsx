import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/dashboard';
// Remove brackets for default export
import { Register } from './pages/authentication/register';
import { Login } from './pages/authentication/login';
import { ForgotPassword } from './pages/authentication/forgot-password';
import { DashboardLayout } from './layouts/DashboardLayout';
import { EventList } from './pages/dashboard/events';
import { CreateEvent } from './pages/dashboard/events/create';
import { EventDetails } from './pages/dashboard/events/details';
import { UpdateEvent } from './pages/dashboard/events/update';
import { RegisteredEvents } from './pages/dashboard/registered';
import { CalendarView } from './pages/dashboard/calendar';
import { ProfileSettings } from './pages/dashboard/profile';
import { UsersAndStaff } from './pages/dashboard/users';

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />
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
        element: <Login /> // This will now work perfectly
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
]);