import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MeetFlow - Modern Meeting Scheduling Platform",
    template: "%s | MeetFlow"
  },
  description: "Simplify your meeting scheduling with MeetFlow. Share your availability, let clients book time slots, and manage all your meetings in one place.",
  keywords: ["meeting scheduling", "calendar booking", "appointment scheduling", "calendly alternative", "meeting management", "online booking"],
  authors: [{ name: "MeetFlow" }],
  creator: "MeetFlow",
  publisher: "MeetFlow",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "MeetFlow",
    title: "MeetFlow - Modern Meeting Scheduling Platform",
    description: "Simplify your meeting scheduling with MeetFlow. Share your availability, let clients book time slots, and manage all your meetings in one place.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MeetFlow - Meeting Scheduling Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MeetFlow - Modern Meeting Scheduling Platform",
    description: "Simplify your meeting scheduling with MeetFlow. Share your availability, let clients book time slots, and manage all your meetings in one place.",
    images: ["/og-image.png"],
    creator: "@meetflow",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
