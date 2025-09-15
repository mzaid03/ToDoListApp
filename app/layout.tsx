
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "To‑Do List",
  description: "Full‑stack Next.js + Prisma",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-500 via-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-float">To‑Do List</h1>
          <p className="text-slate-400 mb-6">Next.js + Prisma</p>
          {children}
        </div>
      </body>
    </html>
  );
}
