import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Breaker19 - Call QA Board",
  description: "AI-powered call center quality assurance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
