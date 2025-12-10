import AuthProvider from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {/* Header appears on all pages */}
            <Header />
            
            {/* Main content area - your pages go here */}
            <main className="flex-grow pt-16">
              {children}
            </main>
            
            {/* Footer appears on all pages */}
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}