import { Navigate } from "react-router-dom";
import { isAdminAuthed } from "@/lib/adminAuth";

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  if (!isAdminAuthed()) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};
