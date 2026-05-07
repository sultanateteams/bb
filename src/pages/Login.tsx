import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { authStore, useAuth } from "@/lib/authStore";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (auth.isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const ok = authStore.login(login, password);
      setLoading(false);
      if (ok) {
        navigate("/dashboard", { replace: true });
      } else {
        setErr("Login yoki parol noto'g'ri");
        setPassword("");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/40 to-primary-muted p-4">
      <Card className="w-full max-w-md p-8 shadow-[var(--shadow-lg)]">
        <div className="flex flex-col items-center mb-7">
          <div className="h-14 w-14 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground mb-3">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Biznes Boshqaruv Tizimi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hisobingizga kiring
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login">Login</Label>
            <Input
              id="login"
              autoFocus
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Parol</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {err && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {err}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Kirish
          </Button>

          <div className="text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Parolni unutdingizmi?
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t text-[11px] text-muted-foreground text-center">
          Demo: <code className="font-mono">admin</code> /{" "}
          <code className="font-mono">admin123</code>
        </div>
      </Card>
    </div>
  );
}
