export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-ink">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-1 justify-center">
          <span className="bg-hazard text-ink font-display font-black text-[26px] leading-none px-3 py-2.5 rounded-[3px] tracking-tighter"
            style={{ boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.25)' }}>43</span>
          <div>
            <h1 className="font-display font-extrabold text-[24px] tracking-tight leading-none">GARAGE</h1>
            <div className="font-cond font-semibold uppercase tracking-[0.16em] text-[11px] text-muted mt-1">Community Hub</div>
          </div>
        </div>
        <div className="hazard-strip h-1.5 rounded-full my-5" />
        {children}
      </div>
    </div>
  )
}
