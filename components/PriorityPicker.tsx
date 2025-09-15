"use client";
type Priority = "LOW" | "MEDIUM" | "HIGH";

export default function PriorityPicker({ value, onChange }: { value: Priority; onChange: (p: Priority) => void }){
  const items: Priority[] = ["LOW","MEDIUM","HIGH"];
  return (
    <div className="flex gap-2">
      {items.map(p => {
        const active = value === p;
        const base = p === 'HIGH' ? 'chip-high' : p === 'LOW' ? 'chip-low' : 'chip-medium';
        return (
          <button
            key={p}
            type="button"
            onClick={()=>onChange(p)}
            className={`tag ${base} px-3 py-1 transition ${active ? 'ring-2 ring-brand-600' : 'opacity-80 hover:opacity-100'}`}
            aria-pressed={active}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}
