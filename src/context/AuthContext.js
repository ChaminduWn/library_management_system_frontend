"use client";
import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const router = useRouter();

  const [auth, setAuth] = useState({
    token: null,
    role: null,      // "LIBRARIAN" or "USER"
    isLoggedIn: false,
  });

  // Load from localStorage when app starts
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setAuth({
        token,
        role,
        isLoggedIn: true,
      });
    }
  }, []);

  // LOGIN FUNCTION
  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    setAuth({
      token,
      role,
      isLoggedIn: true,
    });

    // Redirect based on role
    if (role === "LIBRARIAN") router.push("/admin"); 
    else router.push("/");
  };

  // LOGOUT FUNCTION
  const logout = () => {
    localStorage.clear();
    setAuth({
      token: null,
      role: null,
      isLoggedIn: false,
    });
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
