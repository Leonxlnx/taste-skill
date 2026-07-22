import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Spanline — request tracing", description: "Follow one request across every service boundary." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
