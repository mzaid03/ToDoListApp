
"use client";
import { useState } from "react";

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  priority: "LOW"|"MEDIUM"|"HIGH";
  dueAt?: string | null;
  tagsCsv?: string | null;
  createdAt: string;
};

export default function TodoItem({ todo, onToggle, onDelete, onRename }:{ 
  todo: Todo;
  onToggle: (id:number, completed:boolean)=>Promise<void>;
  onDelete: (id:number)=>Promise<void>;
  onRename: (id:number, title:string)=>Promise<void>;
}){
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todo.title);
  const [busy, setBusy] = useState(false);

  async function save(){
    if (!value.trim() || value.trim() == todo.title) { setEditing(false); return; }
    setBusy(true);
    await onRename(todo.id, value.trim());
    setBusy(false);
    setEditing(false);
  }

  return (
    <div className="card p-3 flex items-start gap-3">
      <input
        aria-label="toggle"
        type="checkbox"
        className="checkbox mt-1"
        checked={todo.completed}
        onChange={()=>onToggle(todo.id, !todo.completed)}
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <input className="input" value={value} onChange={e=>setValue(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') save(); if (e.key==='Escape'){ setEditing(false); setValue(todo.title);} }} />
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className={`truncate ${todo.completed ? 'line-through text-slate-400' : ''}`}>{todo.title}</span>
            <span className="tag">{todo.priority}</span>
            {todo.dueAt && (<span className="tag">Due {new Date(todo.dueAt).toLocaleDateString()}</span>)}
            {todo.tagsCsv && todo.tagsCsv.split(",").filter(Boolean).slice(0,4).map(t=> (
              <span key={t} className="tag">#{t.trim()}</span>
            ))}
          </div>
        )}
        <div className="text-xs text-slate-500 mt-1">Added {new Date(todo.createdAt).toLocaleString()}</div>
      </div>
      <div className="flex gap-2">
        {editing ? (
          <>
            <button className="btn-primary" disabled={busy} onClick={save}>Save</button>
            <button className="btn-ghost" onClick={()=>{setEditing(false); setValue(todo.title);}}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn-ghost" onClick={()=>setEditing(true)}>Edit</button>
            <button className="btn-ghost" onClick={()=>onDelete(todo.id)}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
}
