import "./globals.css";

export const metadata = {
  title: "Tidemark Architecture",
  description: "Coastal architecture shaped by tide, weather, and the daily life of the shore.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
