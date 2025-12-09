"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthState {
  token: string | null;
  role: string | null;
  isLoggedIn: boolean;
}

interface AuthContextType {
  auth: AuthState;
  login: (token: string, role: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ ADD THIS HOOK - This was missing!
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [auth, setAuth] = useState<AuthState>({
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
  const login = (token: string, role: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    setAuth({
      token,
      role,
      isLoggedIn: true,
    });

    // Redirect based on role
    if (role === "LIBRARIAN") router.push("/admin"); 
    else router.push("/books"); // ✅ Changed from "/" to "/books" for better UX
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