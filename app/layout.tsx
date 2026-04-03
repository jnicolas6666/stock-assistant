import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Assistant",
  description: "AI-powered stock market information assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#030712", color: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
