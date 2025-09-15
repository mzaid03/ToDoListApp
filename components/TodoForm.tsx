
"use client";
import { useState } from "react";
import PriorityPicker from "./PriorityPicker";

export type NewTodo = {
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueAt?: string;
  tagsCsv?: string;
};

export default function TodoForm({ onCreate }: { onCreate: (t: NewTodo) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<NewTodo["priority"]>("MEDIUM");
  const [dueAt, setDueAt] = useState<string>("");
  const [tagsCsv, setTagsCsv] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onCreate({ title: title.trim(), priority, dueAt: dueAt || undefined, tagsCsv: tagsCsv || undefined });
      setTitle(""); setDueAt(""); setTagsCsv(""); setPriority("MEDIUM");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="card p-4 mb-4 grid gap-3">
      <div className="grid gap-2">
        <label className="text-sm text-slate-300">Title</label>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Finish math HW" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="grid gap-2">
          <label className="text-sm text-slate-300">Priority</label>
          <PriorityPicker value={priority} onChange={setPriority} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-300">Due date</label>
          <input className="select" type="date" value={dueAt} onChange={e=>setDueAt(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-300">Tags (CSV)</label>
          <input className="input" value={tagsCsv} onChange={e=>setTagsCsv(e.target.value)} placeholder="school, urgent" />
        </div>
      </div>
      <div className="flex gap-2">
        <button disabled={loading} className="btn-primary">{loading ? "Adding…" : "Add To‑Do"}</button>
        <button type="reset" className="btn-ghost" onClick={()=>{setTitle(""); setDueAt(""); setTagsCsv(""); setPriority("MEDIUM");}}>Clear</button>
      </div>
    </form>
  );
}
