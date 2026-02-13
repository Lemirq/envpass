import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex-provider";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";

export const metadata: Metadata = {
  title: "envpass - Stop pasting secrets in Discord",
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
        <AuthKitProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </AuthKitProvider>
      </body>
    </html>
  );
}
