import { supabase } from "@/integrations/supabase/client";

export async function isAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  // Use the SECURITY DEFINER `has_role` function so we don't depend on
  // user_roles RLS being readable in the current session.
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) {
    console.error("isAdmin check failed", error);
    return false;
  }
  return !!data;
}

export async function signOut() {
  await supabase.auth.signOut();
}
