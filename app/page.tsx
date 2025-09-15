
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
  const [hideOffline, setHideOffline] = useState(false);
  const [sortBy, setSortBy] = useState<'created'|'priority'|'due'>('created');

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
      if (/^Database not configured/i.test(msg)) {
        setLocalMode(true);
        setTodos(readLocal());
        setError(null); // hide scary red error once we switch to local mode
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); }, [filters.q, filters.status, filters.priority]);

  // Ctrl+K focuses search
  useEffect(() => {
    function onKey(e: KeyboardEvent){ if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); document.getElementById('search')?.focus(); } }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Hydrate offline banner dismissal
  useEffect(() => {
    try { setHideOffline(localStorage.getItem('hideOffline') === '1'); } catch {}
  }, []);

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
  const progress = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;

  return (
    <div className="grid gap-4">
      {localMode && !hideOffline && (
        <div className="card p-3 border-amber-500/20 flex items-start justify-between gap-3">
          <div>
            <div className="text-amber-300 font-medium">Offline mode: storing tasks in your browser</div>
            <div className="text-slate-300 text-sm">Connect a database later and the app will switch automatically.</div>
          </div>
          <button className="btn-ghost" onClick={()=>{ setHideOffline(true); try{ localStorage.setItem('hideOffline','1'); }catch{} }}>Dismiss</button>
        </div>
      )}

      <TodoForm onCreate={createTodo} />
      <FilterBar onChange={setFilters as any} />

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">{counts.open} open · {counts.done} done · {counts.total} total</div>
        <div className="flex items-center gap-2">
          <select className="select" value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
            <option value="created">Newest</option>
            <option value="priority">Priority</option>
            <option value="due">Due date</option>
          </select>
          <button className="btn-ghost" onClick={()=>{ const next=todos.filter(t=>!t.completed); setTodos(next); if(localMode) writeLocal(next); }}>Clear Completed</button>
          <button className="btn-ghost" onClick={load}>{loading?"Loading…":"Refresh"}</button>
        </div>
      </div>

      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
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
        <div className="grid gap-3">
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
          <div className="skeleton h-16" />
        </div>
      ) : todos.length === 0 ? (
        <div className="text-slate-400">No tasks match your filters.</div>
      ) : (
        <div className="grid gap-3">
          {([...todos].sort((a,b)=>{
            if (sortBy==='created') return new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime();
            if (sortBy==='priority') return (b.priority>a.priority?1:-1);
            if (sortBy==='due') return new Date(a.dueAt||'9999-12-31').getTime()-new Date(b.dueAt||'9999-12-31').getTime();
            return 0;
          })).map(t => (
            <TodoItem key={t.id} todo={t} onToggle={toggle} onDelete={remove} onRename={rename} />
          ))}
        </div>
      )}
    </div>
  );
}
