"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Trophy,
  Users,
  Zap,
  Star,
  Play,
  Shield,
  Smartphone,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setDownloadComplete(true);
          // Here you would trigger actual download
          window.open("/apk/proArena.apk", "_blank");
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <Image
                src="/pro-arena-icon.png"
                alt="Logo"
                width={60}
                height={60}
              />

              <h1 className="text-xl font-bold text-white">ProArena</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-3xl"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-red-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Now Available
                </Badge>

                <h1 className="text-5xl font-poppins lg:text-7xl font-bold text-white leading-tight">
                  Enter the
                  <span className="bg-gradient-to-r from-orange-400 to-red-200 bg-clip-text text-transparent">
                    {" "}
                    Arena
                  </span>
                </h1>

                <p className="text-xl font-poppins font-light text-slate-300 leading-relaxed max-w-lg">
                  Join thousands of gamers in epic tournaments. Compete, win
                  prizes, and climb the leaderboards in the ultimate gaming
                  experience.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 text-white/80">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-orange-400" />
                  </div>
                  <span>Live Tournaments</span>
                </div>

                <div className="flex items-center space-x-3 text-white/80">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-red-400" />
                  </div>
                  <span>Global Players</span>
                </div>

                <div className="flex items-center space-x-3 text-white/80">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Star className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Real Rewards</span>
                </div>

                <div className="flex items-center space-x-3 text-white/80">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-400" />
                  </div>
                  <span>Secure & Fair</span>
                </div>
              </div>

              {/* Download Button */}
              <div className="space-y-4">
                {!downloadComplete ? (
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="group w-full sm:w-auto h-16 px-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-red-600 hover:to-orange-600 text-white font-medium text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-70"
                  >
                    {isDownloading ? (
                      <div className="flex items-center space-x-3">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <div className="flex flex-col items-start">
                          <span>Downloading...</span>
                          <div className="w-32 h-1 bg-white/20 rounded-full mt-1">
                            <div
                              className="h-full bg-white rounded-full transition-all duration-300"
                              style={{ width: `${downloadProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Download className="h-8 w-8 mr-3 group-hover:animate-bounce" />
                        Download ProArena
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center space-x-3 text-green-400">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-semibold">Download Complete!</span>
                  </div>
                )}

                
              </div>
            </div>

            {/* Right Content - App Preview */}
            <div className="relative">
              <div className="relative z-10 mx-auto max-w-sm">
                {/* Phone Mockup */}
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="bg-black rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-black h-8 flex items-center justify-between px-6 text-white text-sm">
                      <span>9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-2 bg-white/60 rounded-sm"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-6 h-3 bg-white/80 rounded-sm"></div>
                      </div>
                    </div>

                    {/* App Screen */}
                    <div className="bg-gradient-to-br from-orange-900 to-slate-900 h-96 flex flex-col items-center justify-center p-8">
                     <Image
                src="/pro-arena-icon.png"
                alt="Logo"
                width={100}
                height={100}
              />

                      <h3 className="text-white text-xl font-bold mb-2">
                        ProArena
                      </h3>
                      <p className="text-white/60 text-center text-sm mb-6">
                        Join live tournaments
                      </p>

                      <div className="w-full space-y-3">
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-center space-x-3">
                            <Play className="h-5 w-5 text-orange-400" />
                            <span className="text-white font-medium">
                              Quick Match
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-center space-x-3">
                            <Trophy className="h-5 w-5 text-yellow-400" />
                            <span className="text-white font-medium">
                              Tournaments
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="h-6 w-6 text-white" />
                </div>

                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-lg border-t border-white/10 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <Image
                src="/pro-arena-icon.png"
                alt="Logo"
                width={60}
                height={60}
              />
              <span className="text-white font-semibold">ProArena</span>
            </div>

            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} ProArena. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
