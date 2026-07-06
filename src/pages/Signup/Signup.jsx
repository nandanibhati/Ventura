import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Input, Select } from "../../components/ui/Input";
import { PrimaryButton } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

export default function Signup() {
  useDocumentTitle("Create Account");
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email) nextErrors.email = "Email is required.";
    if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError("");
    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(user.role === "seller" ? "/seller/dashboard" : "/", { replace: true });
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
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">Join Veluntra to start shopping or selling.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name" placeholder="Jane Doe" value={form.name} onChange={setField("name")} error={errors.name} required />
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={setField("email")}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={setField("password")}
            error={errors.password}
            required
          />
          <Select
            label="Account type"
            value={form.role}
            onChange={setField("role")}
            options={[
              { value: "customer", label: "Customer — shop on Veluntra" },
              { value: "seller", label: "Seller — sell on Veluntra" },
            ]}
          />

          {formError && <p className="text-sm text-error-500">{formError}</p>}

          <div className="mt-2">
            <PrimaryButton type="submit" fullWidth loading={submitting} leftIcon={submitting ? undefined : UserPlus}>
              Create account
            </PrimaryButton>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-gold-600 hover:underline dark:text-gold-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
