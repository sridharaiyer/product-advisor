import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amway Product Advisor",
  description: "Find the perfect Amway products for your needs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
