import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "LanguaFlow",
  description: "Text Transformer",
  other: {
    "origin-trial": [
      "AvdIxkVZvIRZkVOyQnBWGpEdJGUhS7OcIqaab5EHWKy4DK9/KX3GCIEOnFYKPZAbeVww5s17PuFNLv26Tzn31gwAAAB8eyJvcmlnaW4iOiJodHRwczovL2xhbmd1YS1mbG93LXVlZmYudmVyY2VsLmFwcDo0NDMiLCJmZWF0dXJlIjoiTGFuZ3VhZ2VEZXRlY3Rpb25BUEkiLCJleHBpcnkiOjE3NDk1OTk5OTksImlzU3ViZG9tYWluIjp0cnVlfQ==",
      "Ap2UC6TKSYvKiWNmBsm/zcoXLyqeK3PJ/syAT8xaWGdQhywI+9aDr4HgKsd0XUpTS+FUfl4N81C6WCVDDCflCwgAAAB2eyJvcmlnaW4iOiJodHRwczovL2xhbmd1YS1mbG93LXVlZmYudmVyY2VsLmFwcDo0NDMiLCJmZWF0dXJlIjoiVHJhbnNsYXRpb25BUEkiLCJleHBpcnkiOjE3NTMxNDI0MDAsImlzU3ViZG9tYWluIjp0cnVlfQ==",
      "AusgeH9N3wLbeP0ywntIofAHDja7/C8KyuM/GC54KNNcKVR86+g7Z2LUpAqg8LvZUUJ6RUgnJveZLuEN6N+tmAwAAAB6eyJvcmlnaW4iOiJodHRwczovL2xhbmd1YS1mbG93LXVlZmYudmVyY2VsLmFwcDo0NDMiLCJmZWF0dXJlIjoiQUlTdW1tYXJpemF0aW9uQVBJIiwiZXhwaXJ5IjoxNzUzMTQyNDAwLCJpc1N1YmRvbWFpbiI6dHJ1ZX0=",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
