import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nebula — Learning platform',
  description: 'Small cohorts. Real work. Coaches who have done it before.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
