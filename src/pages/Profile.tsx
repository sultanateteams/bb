import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authStore, useAuth } from "@/lib/authStore";
import { PageHeader } from "@/components/PageHeader";

export default function Profile() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);

  const [newLogin, setNewLogin] = useState("");
  const [confirmLogin, setConfirmLogin] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  const saveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Ism va familiya bo'sh bo'lmasligi kerak");
      return;
    }
    authStore.updateProfile(firstName.trim(), lastName.trim());
    toast.success("Ma'lumotlar saqlandi");
  };

  const saveLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    if (!newLogin.trim() || !confirmLogin.trim()) {
      setLoginErr("Maydonlarni to'ldiring");
      return;
    }
    if (newLogin !== confirmLogin) {
      setLoginErr("Loginlar mos kelmadi");
      return;
    }
    authStore.changeLogin(newLogin.trim());
    setNewLogin("");
    setConfirmLogin("");
    toast.success("Login muvaffaqiyatli o'zgartirildi");
  };

  const savePwd = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErr("");
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdErr("Barcha maydonlarni to'ldiring");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdErr("Parollar mos kelmadi");
      return;
    }
    const ok = authStore.changePassword(currentPwd, newPwd);
    if (!ok) {
      setPwdErr("Joriy parol noto'g'ri");
      return;
    }
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    toast.success("Parol muvaffaqiyatli o'zgartirildi");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Profil" subtitle="Shaxsiy ma'lumotlar va xavfsizlik" />

      <Card className="p-5 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-gradient-brand text-primary-foreground text-lg font-semibold">
            {initials || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="text-lg font-semibold">{user.firstName} {user.lastName}</div>
          <div className="text-sm text-muted-foreground">{user.role} · @{user.login}</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold mb-4">Shaxsiy ma'lumotlar</h2>
        <form onSubmit={saveInfo} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fn">Ism</Label>
            <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ln">Familiya</Label>
            <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="lg">Login (foydalanuvchi nomi)</Label>
            <Input id="lg" value={user.login} readOnly className="bg-muted/50" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Saqlash</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold mb-4">Loginni o'zgartirish</h2>
        <form onSubmit={saveLogin} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nl">Yangi login</Label>
            <Input id="nl" value={newLogin} onChange={(e) => setNewLogin(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cl">Loginni tasdiqlang</Label>
            <Input id="cl" value={confirmLogin} onChange={(e) => setConfirmLogin(e.target.value)} />
          </div>
          {loginErr && (
            <div className="sm:col-span-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {loginErr}
            </div>
          )}
          <div className="sm:col-span-2">
            <Button type="submit">Loginni o'zgartirish</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold mb-4">Parolni o'zgartirish</h2>
        <form onSubmit={savePwd} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cp">Joriy parol</Label>
            <Input id="cp" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np">Yangi parol</Label>
            <Input id="np" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cnp">Yangi parolni tasdiqlang</Label>
            <Input id="cnp" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
          </div>
          {pwdErr && (
            <div className="sm:col-span-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {pwdErr}
            </div>
          )}
          <div className="sm:col-span-2">
            <Button type="submit">Parolni o'zgartirish</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
