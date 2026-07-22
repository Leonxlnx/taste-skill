import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Light becomes the material.", description: "A concept site for a contemporary light-art exhibition." };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
