import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/providers/auth-provider";

import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Task Management Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}