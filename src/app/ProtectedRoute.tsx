import { Navigate, Outlet, useLocation } from "react-router-dom";

type Props = {
  isAuthed: boolean;
};

export default function ProtectedRoute({ isAuthed }: Props) {
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
