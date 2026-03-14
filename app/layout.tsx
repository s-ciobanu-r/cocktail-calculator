import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cocktail Batch Calculator",
  description: "Calculate ingredient totals for cocktail batches",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
