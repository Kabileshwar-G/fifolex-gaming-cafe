import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/store/AppContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Fifolex — Gaming Cafe Operations & 3D Control Center',
  description: 'Next-generation management dashboard and 3D venue control system for gaming cafes and esports arenas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#08090d] text-gray-100 antialiased selection:bg-indigo-600 selection:text-white">
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
