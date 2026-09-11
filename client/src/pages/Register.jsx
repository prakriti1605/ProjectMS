// src/pages/Register.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import FormCard from "../components/FormCard";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await register(form);
      navigate("/organisations");
    } catch (err) {
      console.error("Register Error:", err);
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Create your workspace" description="Set up your account and start moving work forward.">
      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg bg-input text-foreground border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="johndoe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg bg-input text-foreground border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="john@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg bg-input text-foreground border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground p-2.5 rounded-lg font-semibold shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 hover:opacity-90 transition disabled:opacity-50 mt-2"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary underline hover:opacity-80">
          Log in
        </Link>
      </p>
    </FormCard>
  );
}