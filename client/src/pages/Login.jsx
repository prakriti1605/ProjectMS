import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import FormCard from "../components/FormCard";
import { useNavigate } from "react-router-dom";

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

  const handleSubmit = async () => {
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (
    <FormCard title="Login">
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

      <button
        onClick={handleSubmit}
        className="w-full bg-primary text-primary-foreground p-2 rounded"
      >
        Login
      </button>
    </FormCard>
  );
}