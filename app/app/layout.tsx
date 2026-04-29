import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Webinar Funnel Analytics',
  description: 'Internal dashboard for webinar funnel performance, identity stitching, and connector health',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className="bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,#020617_0%,#020617_100%)] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
