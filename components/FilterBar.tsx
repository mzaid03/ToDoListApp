
"use client";
import { useState, useEffect } from "react";

type Filters = { q: string; status: "all"|"open"|"done"; priority: "all"|"LOW"|"MEDIUM"|"HIGH" };

export default function FilterBar({ onChange }: { onChange: (f: Filters) => void }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Filters["status"]>("all");
  const [priority, setPriority] = useState<Filters["priority"]>("all");

  useEffect(()=>{ onChange({ q, status, priority }); }, [q, status, priority]);

  return (
    <div className="card p-3 mb-4 grid gap-3 sm:grid-cols-3">
      <input id="search" className="input" placeholder="Search title or tags… (Ctrl+K)" value={q} onChange={e=>setQ(e.target.value)} />
      <select className="select" value={status} onChange={e=>setStatus(e.target.value as Filters["status"])}>
        <option value="all">All</option>
        <option value="open">Open</option>
        <option value="done">Completed</option>
      </select>
      <select className="select" value={priority} onChange={e=>setPriority(e.target.value as Filters["priority"])}>
        <option value="all">Any priority</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>
    </div>
  );
}
