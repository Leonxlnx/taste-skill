import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vector Field — Cybersecurity Research Lab",
  description: "Independent security research across hardware, firmware, networks, and identity systems.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
