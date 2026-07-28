import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import FormCard from "../components/FormCard";
import { Link, useNavigate } from "react-router-dom";


export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async () => {
  setError("");
  setLoading(true);

  try {
    await register(form);
    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <FormCard title="Register">
      <input
        name="username"
        onChange={handleChange}
        className="w-full p-2 rounded bg-input text-foreground border border-border"
        placeholder="Username"
      />

      <input
        name="email"
        onChange={handleChange}
        className="w-full p-2 rounded bg-input text-foreground border border-border"
        placeholder="Email"
      />

      <input
        name="password"
        type="password"
        onChange={handleChange}
        className="w-full p-2 rounded bg-input text-foreground border border-border"
        placeholder="Password"
      />
      {error && (
        <p className="text-red-500 text-sm mb-2">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground p-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-primary font-medium hover:underline"
        >
          Login
        </Link>
      </p>
    </FormCard>
  );
}