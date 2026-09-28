import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Raum Invoice Generator',
  description: 'Minimal thermal receipt style invoice generator'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
