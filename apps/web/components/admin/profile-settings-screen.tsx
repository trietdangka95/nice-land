"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, Lock, User } from "lucide-react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";
import type { UpdateProfileInput, ChangePasswordInput } from "@nice-land/contracts";

export function ProfileSettingsScreen() {
  const toast = useToast();
  
  // Profile state
  const [profileForm, setProfileForm] = useState<UpdateProfileInput>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordInput>({
    currentPassword: "",
    newPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .me()
      .then((user) => {
        if (!active) return;
        setProfileForm({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      })
      .catch((err) => {
        if (active) {
          setProfileError(getErrorMessage(err, "Không thể tải thông tin hồ sơ."));
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    try {
      await api.updateProfile(profileForm);
      toast.success("Thông tin cá nhân đã được cập nhật.", "Thành công");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Không thể lưu hồ sơ."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    try {
      await api.changePassword(passwordForm);
      toast.success("Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại nếu phiên đăng nhập hết hạn.", "Đổi mật khẩu thành công");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Không thể đổi mật khẩu."));
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <div className="h-80 animate-pulse border border-ink/10 bg-white" aria-label="Đang tải thông tin" />;
  }

  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Tài khoản</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Hồ sơ cá nhân</h1>
      <p className="mt-2 text-sm text-ink/50">Cập nhật thông tin liên hệ và mật khẩu tài khoản quản trị.</p>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <form onSubmit={saveProfile} className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <User className="text-moss" size={24} />
            <h2 className="font-display text-2xl">Thông tin liên hệ</h2>
          </div>
          
          <div className="mt-6 grid gap-5">
            <TextField 
              label="Họ và tên" 
              value={profileForm.fullName || ""} 
              onChange={(value) => setProfileForm(prev => ({ ...prev, fullName: value }))} 
            />
            <TextField 
              label="Địa chỉ Email" 
              type="email"
              value={profileForm.email || ""} 
              onChange={(value) => setProfileForm(prev => ({ ...prev, email: value }))} 
            />
            <TextField 
              label="Số điện thoại" 
              value={profileForm.phone || ""} 
              onChange={(value) => setProfileForm(prev => ({ ...prev, phone: value }))} 
            />
          </div>
          
          {profileError && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{profileError}</p>}
          
          <button className="button-primary mt-7 disabled:opacity-60 w-full sm:w-auto" disabled={savingProfile}>
            <Save size={17} /> {savingProfile ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </form>

        <form onSubmit={savePassword} className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Lock className="text-moss" size={24} />
            <h2 className="font-display text-2xl">Đổi mật khẩu</h2>
          </div>
          
          <div className="mt-6 grid gap-5">
            <TextField 
              label="Mật khẩu hiện tại" 
              type="password"
              value={passwordForm.currentPassword} 
              onChange={(value) => setPasswordForm(prev => ({ ...prev, currentPassword: value }))} 
              required
            />
            <TextField 
              label="Mật khẩu mới" 
              type="password"
              value={passwordForm.newPassword} 
              onChange={(value) => setPasswordForm(prev => ({ ...prev, newPassword: value }))} 
              required
            />
          </div>
          
          {passwordError && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{passwordError}</p>}
          
          <button className="button-primary mt-7 disabled:opacity-60 w-full sm:w-auto" disabled={savingPassword}>
            <Save size={17} /> {savingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      </div>
    </>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink/80">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="h-12 min-w-0 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" />
    </label>
  );
}
