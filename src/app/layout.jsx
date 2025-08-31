import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/AuthContext";
import InternetStatus from "../components/InternetStatus";

export const metadata = {
  title: "My Admin Dashboard",
  description: "Next.js + ShadCN Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <InternetStatus />
          {children}
          </AuthProvider>
      </body>
    </html>
  );
}