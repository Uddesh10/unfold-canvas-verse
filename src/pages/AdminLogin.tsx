import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/adminAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Seo } from "@/components/Seo";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "Check your email if confirmation is required, then sign in." });
        setMode("signin");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      const ok = await isAdmin(data.user?.id);
      if (!ok) {
        await supabase.auth.signOut();
        toast({
          title: "Not an admin",
          description: "Your account is signed up, but it doesn't have the admin role yet.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Welcome back" });
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Sign in failed", description: message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 hero-bg">
      <Seo title="Admin — Unfold Studios" description="Admin sign in" path="/admin/login" />
      <form onSubmit={submit} className="glass-strong w-full max-w-sm rounded-3xl p-8 space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Unfold Studios</div>
          <h1 className="font-display text-3xl mt-1">{mode === "signin" ? "Admin sign in" : "Create admin account"}</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Enter" : "Sign up"}
        </Button>
        <button
          type="button"
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
        <p className="text-[11px] text-muted-foreground">
          Admin access requires the <code>admin</code> role. Sign up first, then ask the site owner to grant the role.
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
