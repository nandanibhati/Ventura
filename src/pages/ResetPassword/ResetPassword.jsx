import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { PrimaryButton } from "../../components/ui/Button";
import { authApi } from "../../api/auth";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

export default function ResetPassword() {
  useDocumentTitle("Reset Password");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!token) nextErrors.token = "Reset code is required.";
    if (!newPassword || newPassword.length < 8) nextErrors.newPassword = "Password must be at least 8 characters.";
    if (confirmPassword !== newPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError("");
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setFormError(err.response?.data?.error?.message || "This reset code is invalid or has expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-muted)] px-5 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-soft-lg">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-xl font-medium tracking-[0.2em] text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Veluntra
          </Link>
          <h1 className="mt-4 text-2xl font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
            Set a new password
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">Paste the reset code you received and choose a new password.</p>
        </div>

        {done ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-center">
            <p className="text-sm text-[var(--text-primary)]">Password reset. Redirecting you to sign in&hellip;</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Reset code"
              type="text"
              placeholder="Paste the code from your email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              error={errors.token}
              required
            />
            <Input
              label="New password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
            />

            {formError && <p className="text-sm text-error-500">{formError}</p>}

            <div className="mt-2">
              <PrimaryButton type="submit" fullWidth loading={submitting} leftIcon={submitting ? undefined : KeyRound}>
                Reset password
              </PrimaryButton>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          <Link to="/forgot-password" className="font-medium text-gold-600 hover:underline dark:text-gold-400">
            Request a new code
          </Link>
        </p>
      </div>
    </div>
  );
}
