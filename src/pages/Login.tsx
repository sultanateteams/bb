import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/store/useAuthStore";
import { useLogin } from "@/hooks/useAuth";

const loginSchema = z.object({
  login: z.string().min(1, "Login kiritish majburiy"),
  password: z.string().min(1, "Parol kiritish majburiy"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { isAuthenticated } = useAuth();
  const loginMutation = useLogin();
  const [showPwd, setShowPwd] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "" },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (data: LoginFormValues) => {
    setGlobalError("");
    loginMutation.mutate(data, {
      onError: (error) => {
        if (error.errors) {
          if (error.errors.login) {
            setError("login", { message: error.errors.login[0] });
          }
          if (error.errors.password) {
            setError("password", { message: error.errors.password[0] });
          }
        }

        if (!error.errors) {
          setGlobalError(error.message || "Kirishda xatolik yuz berdi");
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/40 to-primary-muted p-4">
      <Card className="w-full max-w-md p-8 shadow-[var(--shadow-lg)]">
        <div className="flex flex-col items-center mb-7">
          <div className="h-14 w-14 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground mb-3">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Biznes Boshqaruv Tizimi</h1>
          <p className="text-sm text-muted-foreground mt-1">Hisobingizga kiring</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login">Login</Label>
            <Input
              id="login"
              autoFocus
              autoComplete="username"
              placeholder="admin"
              {...register("login")}
            />
            {errors.login && (
              <p className="text-sm text-destructive mt-1">{errors.login.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Parol</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((current) => !current)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                aria-label={showPwd ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          {globalError && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {globalError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loginMutation.isLoading}>
            {loginMutation.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Kirish
          </Button>

          <div className="text-center">
            <button type="button" className="text-xs text-muted-foreground hover:text-primary">
              Parolni unutdingizmi?
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t text-[11px] text-muted-foreground text-center">
          Demo: <code className="font-mono">admin</code> / <code className="font-mono">testtest</code>
        </div>
      </Card>
    </div>
  );
}
