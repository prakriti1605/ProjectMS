import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import FormCard from "../components/FormCard";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (
    <FormCard title="Welcome back" description="Sign in to pick up where your team left off.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-input px-3.5 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="you@company.com"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-input px-3.5 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:opacity-90">
          Sign in
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        New to ProjectMS?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">Create an account</Link>
      </p>
    </FormCard>
  );
}