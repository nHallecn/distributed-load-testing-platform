export function LoadingPanel() {
  return (
    <div className="panel animate-pulse p-6">
      <div className="h-4 w-28 rounded bg-slate-100" />
      <div className="mt-5 h-9 w-52 rounded bg-slate-100" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="h-24 rounded-xl bg-slate-100" />
        <div className="h-24 rounded-xl bg-slate-100" />
        <div className="h-24 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
