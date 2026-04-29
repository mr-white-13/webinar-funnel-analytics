import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Webinar Funnel Analytics',
  description: 'Internal dashboard for webinar funnel performance, identity stitching, and connector health',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-[#f5f2ec]">
      <body className="bg-[#f5f2ec] text-stone-900 antialiased">{children}</body>
    </html>
  );
}
