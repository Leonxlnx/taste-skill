import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/nav/Sidebar';

export const metadata: Metadata = {
  title: 'ReefGuard – Domain Trust Monitor',
  description: 'Continuous Domain & Email Trust Monitoring by GMI Security',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050505] text-slate-100 antialiased">
        <div className="flex min-h-screen relative">
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-reef-teal/[0.04] blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-reef-cyan/[0.03] blur-[100px] rounded-full" />
          </div>
          <Sidebar />
          <main className="flex-1 overflow-auto relative z-10 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
