import type { Metadata } from "next";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Inlyne",
  description: "Inlyne - Seamless Documentation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}