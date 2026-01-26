import { Navigate, Outlet, useLocation } from "react-router-dom";

type Props = {
  isAuthed: boolean;
  loading?: boolean;
};

export default function ProtectedRoute({ isAuthed, loading }: Props) {
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Checking session…
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
