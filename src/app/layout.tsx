import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "envpass - Secure Environment Manager",
  description: "The secure way to share secrets at hackathons. Fast, ephemeral, encrypted.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
