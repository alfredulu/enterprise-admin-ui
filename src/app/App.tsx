import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import UsersPage from "@/pages/UsersPage";
import TicketsPage from "@/pages/TicketsPage";
import TicketDetailsPage from "@/pages/TicketDetailsPage";
import SettingsPage from "@/pages/SettingsPage";
import ProtectedRoute from "@/app/ProtectedRoute";
import { useSession } from "@/features/auth/useSession";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AuthCallbackPage from "@/pages/AuthCallbackPage";

export default function App() {
  const { isAuthed, loading } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading) {
      queryClient.clear();
    }
  }, [isAuthed, loading, queryClient]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route element={<ProtectedRoute isAuthed={isAuthed} loading={loading} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
