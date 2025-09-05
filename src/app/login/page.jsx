"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useAuth } from "@/lib/AuthContext";
import { firebaseConfig } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Lock, Mail, Shield, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, loading } = useAuth();

  // Handle redirect in useEffect to avoid render issues
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading || isLoggingIn) return;

    setIsLoggingIn(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", userCredential.user);
      // The redirect will happen automatically via useEffect when user state updates
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      alert("Login failed: " + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Show loading state
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  );
  
  // Show loading state while redirecting
  if (user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <p className="text-slate-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10"></div>
      
      {/* Back to Home Button */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center pb-6">
          {/* Logo/Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-slate-600 text-base">
              Sign in to manage ProArena
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-200"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-200"
                required
              />
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              disabled={loading || isLoggingIn} 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing you in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In to Dashboard
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-center text-sm text-slate-500">
              Authorized personnel only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}