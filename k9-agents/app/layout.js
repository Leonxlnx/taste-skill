export const metadata = {
  title: "K9 Agents — K9 Experience Solution",
  description: "Système multi-agents IA pour K9 Experience Solution S.A.R.L.-S",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, background: "#0a0a0f" }}>{children}</body>
    </html>
  );
}
