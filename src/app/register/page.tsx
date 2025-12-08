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
      window.location.href = "/login";
    } else {
      alert(data || "Registration failed");
    }
  };

  return (
    <div className="max-w-md p-8 mx-auto mt-20 bg-white border border-gray-200 shadow-lg rounded-xl">
      <h1 className="mb-6 text-3xl font-bold text-center">Create Account</h1>

      <div className="space-y-4">
        <input
          className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full p-3 font-semibold text-white transition bg-green-600 rounded-lg hover:bg-green-700"
        >
          Register
        </button>
      </div>

      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-blue-600 hover:underline">
          Login
        </a>
      </p>
    </div>
  );
}
