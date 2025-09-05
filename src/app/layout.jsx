import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/AuthContext";
import { Inter, Poppins } from "next/font/google";
import InternetStatus from "../components/InternetStatus";

// Google font example
const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700", "800", "900"] });



export const metadata = {
  title: "ProArena",
  description: "Next.js + ShadCN Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} ${poppins.className}`} >
      <body>
        <AuthProvider>
          <InternetStatus />
          {children}
          </AuthProvider>
      </body>
    </html>
  );
}