"use client";
import { useEffect, useState } from "react";

export default function InternetStatus() {
  const [isOnline, setIsOnline] = useState(true);

  const checkInternet = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      // Ping a reliable endpoint (favicon is tiny and cached)
      const response = await fetch("/favicon.ico?check=" + Date.now(), {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    // Run immediately
    checkInternet();

    // Then check every 5s
    const interval = setInterval(checkInternet, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isOnline) {
    return (
      <div style={{ background: "red", color: "white", padding: "10px", textAlign: "center" }}>
        ❌ No internet connection detected.
      </div>
    );
  }

  return null;
}
