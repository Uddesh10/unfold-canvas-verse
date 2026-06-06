import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/adminAuth";

type State = "loading" | "ok" | "deny";

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let cancelled = false;

    const check = async (userId: string | undefined) => {
      const ok = await isAdmin(userId);
      if (!cancelled) setState(ok ? "ok" : "deny");
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      check(session?.user?.id);
    });

    supabase.auth.getSession().then(({ data }) => {
      check(data.session?.user?.id);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }
  if (state === "deny") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};
