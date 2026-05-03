import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInAdmin } from "@/lib/adminAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Seo } from "@/components/Seo";

const AdminLogin = () => {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signInAdmin(pw)) {
      toast({ title: "Welcome back" });
      navigate("/admin", { replace: true });
    } else {
      toast({ title: "Wrong password", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 hero-bg">
      <Seo title="Admin — Unfold Studios" description="Admin sign in" path="/admin/login" />
      <form
        onSubmit={submit}
        className="glass-strong w-full max-w-sm rounded-3xl p-8 space-y-5"
      >
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            Unfold Studios
          </div>
          <h1 className="font-display text-3xl mt-1">Admin sign in</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Password</Label>
          <Input
            id="pw"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Enter
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Client-side gate only. Anyone with developer tools can read the password — use this for casual privacy, not real security.
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
