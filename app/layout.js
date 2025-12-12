import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Assuming these are the correct imports for your font setup
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RideMate - Driver & Car Booking", // A better default title
  description: "Driver and Car Booking Platform",
};

// This is the REQUIRED default export that returns JSX
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
