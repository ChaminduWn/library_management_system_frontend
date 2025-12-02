"use client";

import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "USER" }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registered successfully! Please login.");
      window.location.href = "/login"; // redirect to login page
    } else {
      alert(data || "Registration failed");
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-20 space-y-4 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">Register</h1>

      <input
        className="w-full p-2 border rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full p-2 border rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        className="w-full p-2 border rounded"
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        className="w-full p-2 text-white bg-green-600 rounded"
      >
        Register
      </button>

      <p className="mt-2 text-sm text-center">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Login
        </a>
      </p>
    </div>
  );
}

