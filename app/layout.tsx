import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "SQL Explorer",
  description: "Interactive SQL editor powered by PostgreSQL & Supabase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0f172a" }}>
        {children}
      </body>
    </html>
  );
}
