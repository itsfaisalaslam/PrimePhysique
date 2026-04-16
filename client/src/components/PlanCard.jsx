const PlanCard = ({ title, subtitle, badge, items = [], footer }) => {
  return (
    <div className="card p-6 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {badge && (
          <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-300">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item._id || item.name || item.label} className="rounded-2xl bg-slate-950/70 p-4">
            <p className="font-semibold text-white">{item.name || item.label}</p>
            {item.sets && item.reps && (
              <p className="mt-1 text-sm text-slate-400">
                {item.sets} sets x {item.reps} reps
              </p>
            )}
            {item.details && <p className="mt-1 text-sm text-slate-400">{item.details}</p>}
          </div>
        ))}
      </div>

      {footer && <div className="mt-5 text-sm text-slate-300">{footer}</div>}
    </div>
  );
};

export default PlanCard;
