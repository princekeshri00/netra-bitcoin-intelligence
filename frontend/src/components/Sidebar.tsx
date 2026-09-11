export type Page = 'dashboard' | 'alerts' | 'investigation';

export default function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  const items: { id: Page; label: string; hint: string }[] = [
    { id: 'dashboard', label: 'Overview', hint: 'System state' },
    { id: 'alerts', label: 'Alert Log', hint: 'Ranked leads' },
    { id: 'investigation', label: 'Case File', hint: 'Active entity' },
  ];

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col bg-ink text-slate-300">
      <div className="px-6 pb-5 pt-7">
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif text-[32px] font-semibold leading-none text-stamp">N</span>
          <span className="font-serif text-xl font-semibold leading-none text-white">ETRA</span>
        </div>
        <p className="mt-2 text-[12.5px] leading-snug text-slate-400">
          Network Entity Tracking &amp; Risk Analysis
        </p>
      </div>

      <div className="h-px bg-ink-line" />

      <nav className="flex-1 px-3 py-5">
        {items.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group relative mb-1 flex w-full flex-col items-start rounded-sm py-2.5 pl-4 pr-3 text-left transition-colors ${
                active ? 'bg-ink-soft text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r ${
                  active ? 'bg-stamp' : 'bg-transparent'
                }`}
              />
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-[11px] text-slate-500">{item.hint}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-ink-line px-6 py-4">
        <p className="text-[11px] leading-relaxed text-slate-500">
          PS 26146 · NTRO<br />Offline · local dataset only
        </p>
      </div>
    </aside>
  );
}
