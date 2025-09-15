
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "PrioritiTask",
  description: "Full‑stack Next.js + Prisma",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <div className="mx-auto max-w-3xl px-4 py-8 flex-1 w-full">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-500 via-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-float">PrioritiTask</h1>
          {children}
        </div>
        <footer className="mt-auto w-full border-t border-white/10">
          <div className="mx-auto max-w-3xl px-4 py-6 text-center text-sm text-slate-400">
            © 2025 Mohammed Zaid. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
