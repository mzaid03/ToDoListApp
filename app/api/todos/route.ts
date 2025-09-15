
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
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
            { title: { contains: q, mode: "insensitive" } },
            { tagsCsv: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: [{ completed: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(todos);
}

export async function POST(req: Request) {
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
}
