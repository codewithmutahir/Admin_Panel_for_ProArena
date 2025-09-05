import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/AuthContext";
import { Inter, Poppins } from "next/font/google";
import InternetStatus from "../components/InternetStatus";

// Google font example
const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata = {
  title: "ProArena - Free Fire Tournaments & Esports Platform",
  description:
    "ProArena is your ultimate platform for Free Fire tournaments – join competitive matches, win rewards, and showcase your gaming skills. Register now and be part of the action!",
  openGraph: {
    title: "ProArena - Free Fire Tournaments",
    description:
      "Compete in Free Fire tournaments, earn rewards, and join the ProArena gaming community.",
    url: "https://proarena.vercel.app",
    siteName: "ProArena",
    images: [
      {
        url: "/pro-arena-icon.png", // apni image rakho
        width: 1200,
        height: 630,
        alt: "ProArena Free Fire Tournament",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProArena - Free Fire Tournaments",
    description:
      "Join ProArena to play Free Fire tournaments, win prizes, and grow your skills.",
    images: ["/pro-arena-icon.png"],
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} ${poppins.className}`}>
      <body>
        <AuthProvider>
          <InternetStatus />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
