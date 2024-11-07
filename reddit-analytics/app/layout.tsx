import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reddit Insights",
  description: "Analyzesubreddits and their posts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#121212]">
        {children}
      </body>
    </html>
  );
}
