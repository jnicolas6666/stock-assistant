import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Assistant",
  description: "AI-powered stock market information assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#000", color: "#f5f5f5", fontFamily: "system-ui, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
