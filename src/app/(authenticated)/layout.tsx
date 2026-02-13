import { ConvexClientProvider } from "@/lib/convex-provider";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthKitProvider>
      <ConvexClientProvider>
        {children}
      </ConvexClientProvider>
    </AuthKitProvider>
  );
}
