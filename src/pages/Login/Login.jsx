import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { PrimaryButton } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!email) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") navigate("/admin", { replace: true });
      else if (user.role === "seller") navigate("/seller/dashboard", { replace: true });
      else navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.error?.message || "Something went wrong. Please try again.");
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
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">Sign in to continue to your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          {formError && <p className="text-sm text-error-500">{formError}</p>}

          <div className="mt-2">
            <PrimaryButton type="submit" fullWidth loading={submitting} leftIcon={submitting ? undefined : Lock}>
              Sign in
            </PrimaryButton>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-gold-600 hover:underline dark:text-gold-400">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
