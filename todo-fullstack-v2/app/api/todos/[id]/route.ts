
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await _req.json();
  const data: any = {};
  if ("title" in body) data.title = String(body.title);
  if ("completed" in body) data.completed = Boolean(body.completed);
  if ("priority" in body) data.priority = body.priority;
  if ("dueAt" in body) data.dueAt = body.dueAt ? new Date(body.dueAt) : null;
  if ("tagsCsv" in body) data.tagsCsv = body.tagsCsv ?? null;

  const updated = await prisma.todo.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.todo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
