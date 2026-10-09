import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/nav/Sidebar';

export const metadata: Metadata = {
  title: 'ReefGuard – Domain Trust Monitor',
  description: 'Continuous Domain & Email Trust Monitoring by GMI Security',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ocean-900 text-slate-200">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
