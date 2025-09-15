
"use client";
import { useEffect, useMemo, useState } from "react";
import TodoForm, { NewTodo } from "@/components/TodoForm";
import TodoItem, { Todo } from "@/components/TodoItem";
import FilterBar from "@/components/FilterBar";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers||{}) } });
  if (!res.ok) {
    let message = res.statusText || `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) message = (() => {
        try { const j = JSON.parse(text); return j.error || j.message || text; } catch { return text; }
      })();
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export default function Page(){
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filters, setFilters] = useState<{q:string; status:"all"|"open"|"done"; priority: "all"|"LOW"|"MEDIUM"|"HIGH"}>({ q:"", status:"all", priority:"all" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [localMode, setLocalMode] = useState(false);

  // Simple local fallback store
  function readLocal(): Todo[] {
    try { return JSON.parse(localStorage.getItem("todos") || "[]"); } catch { return []; }
  }
  function writeLocal(items: Todo[]) {
    localStorage.setItem("todos", JSON.stringify(items));
  }

  async function load(){
    setLoading(true);
    setError(null);
    try {
      if (localMode) {
        let items = readLocal();
        const q = filters.q.toLowerCase();
        if (filters.status !== "all") items = items.filter(t => (filters.status === "done") === t.completed);
        if (filters.priority !== "all") items = items.filter(t => t.priority === filters.priority);
        if (q) items = items.filter(t => t.title.toLowerCase().includes(q) || (t.tagsCsv||"").toLowerCase().includes(q));
        setTodos(items);
      } else {
        const params = new URLSearchParams({ q: filters.q, status: filters.status, priority: filters.priority });
        const data = await api<Todo[]>(`/api/todos?${params.toString()}`);
        setTodos(data);
      }
    } catch (e:any) {
      const msg = e?.message || "Failed to load to‑dos";
      setError(msg);
      if (/^Database not configured/i.test(msg)) {
        setLocalMode(true);
        setTodos(readLocal());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); }, [filters.q, filters.status, filters.priority]);

  async function createTodo(newTodo: NewTodo){
    const optimistic: Todo = {
      id: Math.random()*1e9|0,
      title: newTodo.title,
      completed: false,
      priority: newTodo.priority,
      dueAt: newTodo.dueAt ?? null,
      tagsCsv: newTodo.tagsCsv ?? null,
      createdAt: new Date().toISOString(),
    };
    if (localMode) {
      const next = [optimistic, ...todos];
      setTodos(next); writeLocal(next);
      return;
    }
    setTodos(prev => [optimistic, ...prev]);
    try {
      const created = await api<Todo>(`/api/todos`, { method: "POST", body: JSON.stringify(newTodo) });
      setTodos(prev => prev.map(t => t.id === optimistic.id ? created : t));
    } catch (e:any){
      setTodos(prev => prev.filter(t => t.id !== optimistic.id));
      setError(e?.message || "Failed to create to‑do");
      if (/^Database not configured/i.test(e?.message||"")) {
        setLocalMode(true);
        const next = [optimistic, ...readLocal()]; writeLocal(next); setTodos(next);
      }
    }
  }

  async function toggle(id:number, completed:boolean){
    const old = todos;
    setTodos(prev => prev.map(t => t.id===id ? { ...t, completed } : t));
    if (localMode) { writeLocal(todos.map(t=>t.id===id?{...t,completed}:t)); return; }
    try { await api(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify({ completed }) }); }
    catch (e:any) { setTodos(old); setError(e?.message || "Failed to update"); }
  }

  async function rename(id:number, title:string){
    const old = todos;
    setTodos(prev => prev.map(t => t.id===id ? { ...t, title } : t));
    if (localMode) { writeLocal(todos.map(t=>t.id===id?{...t,title}:t)); return; }
    try { await api(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify({ title }) }); }
    catch (e:any) { setTodos(old); setError(e?.message || "Failed to rename"); }
  }

  async function remove(id:number){
    const old = todos;
    setTodos(prev => prev.filter(t => t.id!==id));
    if (localMode) { writeLocal(todos.filter(t=>t.id!==id)); return; }
    try { await api(`/api/todos/${id}`, { method: "DELETE" }); }
    catch (e:any) { setTodos(old); setError(e?.message || "Failed to delete"); }
  }

  const counts = useMemo(()=>({
    total: todos.length,
    open: todos.filter(t=>!t.completed).length,
    done: todos.filter(t=>t.completed).length,
  }), [todos]);

  return (
    <div className="grid gap-4">
      <TodoForm onCreate={createTodo} />
      <FilterBar onChange={setFilters as any} />

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">{counts.open} open · {counts.done} done · {counts.total} total</div>
        <button className="btn-ghost" onClick={load}>{loading?"Loading…":"Refresh"}</button>
      </div>

      {error ? (
        <div className="card p-3 text-red-300">
          <div className="font-medium">{error}</div>
          {/^Database not configured/i.test(error || "") && (
            <div className="text-slate-300 mt-2 text-sm">
              The server is running but the database isn’t configured. Set the <code>DATABASE_URL</code> environment variable on your host and redeploy.
            </div>
          )}
          <button className="btn-ghost mt-2" onClick={load}>Try again</button>
        </div>
      ) : loading ? (
        <div className="text-slate-400">Loading tasks…</div>
      ) : todos.length === 0 ? (
        <div className="text-slate-400">No tasks match your filters.</div>
      ) : (
        <div className="grid gap-3">
          {todos.map(t => (
            <TodoItem key={t.id} todo={t} onToggle={toggle} onDelete={remove} onRename={rename} />
          ))}
        </div>
      )}
    </div>
  );
}
