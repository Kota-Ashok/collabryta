import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import MainLayout from "./layouts/MainLayout";
import ScrollToTop from "./components/ScrollToTop";
import { NotificationProvider } from "./context/NotificationContext";
import { authService } from "./services/authService";

// Pages
import AuthPage from "./pages/Auth/AuthPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ProfilePage from "./pages/Auth/ProfilePage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import MessagesPage from "./pages/Messages/MessagesPage";
import MeetingsPage from "./pages/Meetings/MeetingsPage";
import ScheduleMeetingPage from "./pages/Meetings/ScheduleMeetingPage";
import CalendarPage from "./pages/Calendar/CalendarPage";
import FilesPage from "./pages/Files/FilesPage";
import UploadFilePage from "./pages/Files/UploadFilePage";
import SettingsPage from "./pages/Settings/SettingsPage";
import TasksPage from "./pages/Tasks/TasksPage";
import AddTaskPage from "./pages/Tasks/AddTaskPage";
import EditTaskPage from "./pages/Tasks/EditTaskPage";


/* 🔒 Protected Route */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  authService.isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;

/* 🌐 Routes Wrapper (for AnimatePresence) */
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPage />
            )
          }
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/meetings/schedule" element={<ScheduleMeetingPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/files/upload" element={<UploadFilePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/add" element={<AddTaskPage />} />
          <Route path="/tasks/:id" element={<EditTaskPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="h-screen flex items-center justify-center text-gray-500 text-xl">
              404 — Page Not Found
            </div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <NotificationProvider>
      <ScrollToTop />
      <AnimatedRoutes />
    </NotificationProvider>
  </BrowserRouter>
);

export default App;
