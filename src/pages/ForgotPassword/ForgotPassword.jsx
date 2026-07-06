import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { PrimaryButton } from "../../components/ui/Button";
import { authApi } from "../../api/auth";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

export default function ForgotPassword() {
  useDocumentTitle("Forgot Password");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Something went wrong. Please try again.");
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
            Reset your password
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Enter your email and we&apos;ll send you a code to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-center">
            <p className="text-sm text-[var(--text-primary)]">
              If an account exists for <span className="font-medium">{email}</span>, a reset code is on its way.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
              className="mt-4 text-sm font-medium text-gold-600 hover:underline dark:text-gold-400"
            >
              I have my code &rarr;
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
            />
            <div className="mt-2">
              <PrimaryButton type="submit" fullWidth loading={submitting} leftIcon={submitting ? undefined : Mail}>
                Send reset code
              </PrimaryButton>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Remembered your password?{" "}
          <Link to="/login" className="font-medium text-gold-600 hover:underline dark:text-gold-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
