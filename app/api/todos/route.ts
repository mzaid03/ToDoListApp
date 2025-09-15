
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured. Set DATABASE_URL on the server." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() ?? "";
    const status = searchParams.get("status") ?? "all";
    const priority = searchParams.get("priority") ?? "all";

    const where: any = {};
    if (status !== "all") where.completed = status === "done";
    if (priority !== "all") where.priority = priority;

    const todos = await prisma.todo.findMany({
      where: {
        ...where,
        OR: q
          ? [
              { title: { contains: q } },
              { tagsCsv: { contains: q } },
            ]
          : undefined,
      },
      orderBy: [{ completed: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(todos);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured. Set DATABASE_URL on the server." },
        { status: 503 }
      );
    }
    const body = await req.json();
    const { title, priority = "MEDIUM", dueAt, tagsCsv } = body ?? {};
    if (!title || typeof title !== "string") return NextResponse.json({ error: "Title required" }, { status: 400 });
    const todo = await prisma.todo.create({
      data: {
        title,
        priority,
        dueAt: dueAt ? new Date(dueAt) : null,
        tagsCsv: tagsCsv ?? null,
      },
    });
    return NextResponse.json(todo, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
