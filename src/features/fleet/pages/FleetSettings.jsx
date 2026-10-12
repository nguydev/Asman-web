import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthContext.jsx";
import { authService } from "../../../api/services/authService.js";
import { useFileUploader } from "../../../hooks/useFileUploader.js";
import Icon from "../../../components/common/Icon.jsx";
import {
  formatPhoneInput,
  isValidPhoneInput,
  toE164,
} from "../../../utils/phone.js";
import toast from "react-hot-toast";

const fieldLabel = "block text-xs font-medium text-zinc-500 dark:text-zinc-400";
const fieldInput =
  "mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

export default function FleetSettings() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const {
    uploadPublicAsset,
    isUploading,
    error: uploadError,
    setError: setUploadError,
  } = useFileUploader();
  const fileInputRef = useRef(null);

  const setField = (key) => (e) =>
    setProfile((p) => ({ ...p, [key]: e.target.value }));

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneInput(e.target.value);
    setProfile((p) => ({ ...p, phone: formatted }));
    if (phoneError && isValidPhoneInput(formatted)) {
      setPhoneError("");
    }
  };

  const handlePhoneBlur = () => {
    if (!isValidPhoneInput(profile.phone)) {
      setPhoneError("Invalid phone number");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large (max 10MB)");
      return;
    }

    // Optimistically update the UI immediately
    const previousAvatar = user.avatar;
    const tempUrl = URL.createObjectURL(file);
    setUser((u) => ({ ...u, avatar: tempUrl }));

    try {
      // PUBLIC durable URL for profile avatarUrl (requires STORAGE_PUBLIC_BASE_URL).
      const { url: publicUrl } = await uploadPublicAsset(file);

      await authService.updateProfile({ avatarUrl: publicUrl });

      setUser((u) => ({ ...u, avatar: publicUrl }));
      URL.revokeObjectURL(tempUrl);

      toast.success("Profile photo updated.");
    } catch (err) {
      console.error(err);
      // Revert to old avatar on failure
      setUser((u) => ({ ...u, avatar: previousAvatar }));
      URL.revokeObjectURL(tempUrl);

      toast.error(
        uploadError ||
          err.message ||
          "Failed to update avatar",
      );
      if (!uploadError) {
        setUploadError(err.message || "Failed to update avatar");
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!isValidPhoneInput(profile.phone)) {
      setPhoneError("Invalid phone number");
      toast.error("Please enter a valid phone number.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const phoneToSend = toE164(profile.phone);

      await authService.updateProfile({
        name: profile.fullName,
        phone: phoneToSend,
      });
      setUser((u) => ({ ...u, name: profile.fullName, phone: phoneToSend }));
      toast.success("Profile changes saved.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pw.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    setIsSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: pw.current,
        newPassword: pw.next,
      });
      setPw({ current: "", next: "", confirm: "" });
      setShowCurrent(false);
      setShowNext(false);

      toast.success("Password updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-zinc-100 pb-2 text-sm font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        Profile Information
      </div>

      {/* profile information */}
      <form
        onSubmit={handleSave}
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-zinc-900 dark:text-zinc-50">
              Profile Information
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Update your basic details and profile visibility.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
            >
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row">
          <div className="flex shrink-0 flex-col items-center gap-2 relative">
            <div className="relative">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-500 dark:text-zinc-400 relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className={`h-full w-full object-cover transition duration-300 ${isUploading ? "opacity-50 blur-[2px]" : ""}`}
                  />
                ) : (
                  <Icon
                    name="user"
                    size={32}
                    className="text-zinc-500 dark:text-zinc-400"
                  />
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <Icon
                      name="spinner"
                      size={24}
                      className="animate-spin text-brand drop-shadow-md"
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-brand text-white transition hover:brightness-110 dark:border-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="edit" size={11} />
              </button>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/webp"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              Profile Photo
            </p>
            <p className="text-center text-xs text-zinc-400">
              {uploadError ? (
                <span className="text-red-500">{uploadError}</span>
              ) : (
                "PNG, JPG up to 10MB"
              )}
            </p>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={fieldLabel}>Full Name</label>
              <input
                value={profile.fullName}
                onChange={setField("fullName")}
                className={fieldInput}
              />
            </div>
            <div>
              <label className={fieldLabel}>Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                placeholder="+1 (555) 555-5555"
                className={`${fieldInput} ${phoneError ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : ""}`}
              />
              {phoneError && (
                <p className="mt-1 text-xs text-red-500">{phoneError}</p>
              )}
            </div>
            {/* <div>
              <label className={fieldLabel}>Job Title</label>
              <input
                value={profile.jobTitle}
                onChange={setField('jobTitle')}
                className={fieldInput}
              />
            </div>*/}
          </div>
        </div>
      </form>

      {/* security & credentials */}
      <form
        onSubmit={handlePasswordUpdate}
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50">
          Security &amp; Credentials
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your password and advanced security protocols.
        </p>

        <p className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand dark:text-brand-dark">
          <Icon name="lock" size={13} />
          Update Password
        </p>

        <div className="mt-3 max-w-sm">
          <label className={fieldLabel}>Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={pw.current}
              onChange={(e) =>
                setPw((p) => ({ ...p, current: e.target.value }))
              }
              className={fieldInput + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute inset-y-0 right-2 mt-1.5 flex items-center text-zinc-400 hover:text-zinc-600"
            >
              <Icon name={showCurrent ? "eyeOff" : "eye"} size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={fieldLabel}>New Password</label>
            <div className="relative">
              <input
                type={showNext ? "text" : "password"}
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                placeholder="Min. 8 characters"
                className={fieldInput + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowNext((v) => !v)}
                className="absolute inset-y-0 right-2 mt-1.5 flex items-center text-zinc-400 hover:text-zinc-600"
              >
                <Icon name={showNext ? "eyeOff" : "eye"} size={16} />
              </button>
            </div>
          </div>
          <div>
            <label className={fieldLabel}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showNext ? "text" : "password"}
                value={pw.confirm}
                onChange={(e) =>
                  setPw((p) => ({ ...p, confirm: e.target.value }))
                }
                placeholder="Repeat new password"
                className={fieldInput + " pr-10"}
              />
            </div>
          </div>
        </div>

        {pwError && <p className="mt-3 text-xs text-red-500">{pwError}</p>}

        <button
          type="submit"
          disabled={isSavingPassword || !pw.current || !pw.next}
          className="mt-4 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white disabled:opacity-70"
        >
          {isSavingPassword ? "Updating..." : "Update Password"}
        </button>
      </form>

      {/* danger zone */}
      <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-5 dark:border-red-500/30 dark:bg-zinc-900">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Sign out of your account
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            You will need to sign in again to access the dashboard.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <Icon name="logout" size={15} />
          Logout
        </button>
      </div>
    </div>
  );
}
