import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "./components/UIProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prottoy-academy.vercel.app"),
  title: {
    default: "Prottoy Academy | প্রত্যয় একাডেমি — Bhabki Bazar, Melandah, Jamalpur",
    template: "%s | Prottoy Academy",
  },

  verification: {
  google: "AhOiq5K8bLppnQXfdK8TBapZuF5X4JUXS9j8JaInDBE",
},
  description:
    "Prottoy Academy (প্রত্যয় একাডেমি) is a specialized academic coaching center and digital education management portal in Bhabki Bazar, Melandah, Jamalpur for Class 6–10 students.",
  keywords: [
    "Prottoy Academy",
    "প্রত্যয় একাডেমি",
    "Prottoy Academy Bhabki Bazar",
    "প্রত্যয় একাডেমি ভাবকী বাজার",
    "Melandah Coaching Center",
    "Jamalpur Coaching",
    "Student Portal Prottoy Academy",
  ],
  icons: {
    icon: "/prottoy academy logo.png",
    apple: "/prottoy academy logo.png",
  },
  openGraph: {
    title: "Prottoy Academy | প্রত্যয় একাডেমি",
    description:
      "Integrated Education Management System & Academic Coaching Center — Bhabki Bazar, Melandah, Jamalpur.",
    url: "https://prottoy-academy.vercel.app",
    siteName: "Prottoy Academy",
    images: [
      {
        url: "/prottoy academy logo.png",
        width: 512,
        height: 512,
        alt: "Prottoy Academy Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="...">
  <UIProvider>{children}</UIProvider>
</body>
    </html>
  );
}
