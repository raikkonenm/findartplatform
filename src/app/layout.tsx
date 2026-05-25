import type { Metadata } from "next";
import localFont from "next/font/local";
import { SavedExhibitionsProvider } from "@/components/SavedExhibitions";
import "./globals.css";

const sfPro = localFont({
  src: [
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "FindArt Platform",
    template: "%s | FindArt Platform",
  },
  description: "International exhibition archive and open submission platform.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sfPro.variable}>
        <SavedExhibitionsProvider>
          {children}
          {modal}
        </SavedExhibitionsProvider>
      </body>
    </html>
  );
}
