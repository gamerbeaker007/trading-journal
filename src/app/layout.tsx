import { AppProviders } from "@/app/providers";
import { AppShell } from "@/components/AppShell";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "Bitcoin trading journal & position calculator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <AppProviders>
            <AppShell>{children}</AppShell>
          </AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
