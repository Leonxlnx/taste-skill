import "./globals.css";

export const metadata = {
  title: "Stillwater House — A small hotel by the North Sea",
  description: "A quiet coastal stay shaped by wind, tide, and the room you return to.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
