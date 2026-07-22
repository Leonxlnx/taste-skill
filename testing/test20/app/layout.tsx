import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOMA H1 — Listen past the room.",
  description: "A product-launch concept for over-ear headphones built around focused listening.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
