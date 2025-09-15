import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  if (!hasDatabaseUrl) {
    return NextResponse.json({ ok: false, hasDatabaseUrl, db: "down", error: "DATABASE_URL is not set" }, { status: 503 });
  }
  try {
    // Use a generic query that doesn't depend on application schema
    await prisma.$executeRawUnsafe("SELECT 1");
    return NextResponse.json({ ok: true, hasDatabaseUrl, db: "up" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, hasDatabaseUrl, db: "down", error: e?.message || String(e) }, { status: 500 });
  }
}
