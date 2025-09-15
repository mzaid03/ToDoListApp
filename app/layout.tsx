
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "To‑Do List",
  description: "Full‑stack Next.js + Prisma + SQLite",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-3xl font-bold tracking-tight">To‑Do List</h1>
          <p className="text-slate-400 mb-6">Next.js + Prisma + SQLite</p>
          {children}
        </div>
      </body>
    </html>
  );
}
