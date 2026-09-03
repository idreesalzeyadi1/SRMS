import { useCountUp } from "../utils/helpers";

export default function StatTile({ icon: Icon, label, value, gradient, delay = 0 }) {
  const count = useCountUp(value);
  return (
    <div className="smrs-tile smrs-fade" style={{ background: gradient, animationDelay: `${delay}s` }}>
      <div className="icon-wrap"><Icon size={16} color="#04150F" /></div>
      <p className="smrs-digit text-2xl" style={{ fontWeight: 800 }}>{count}</p>
      <p className="text-xs mt-0.5" style={{ fontWeight: 500, opacity: 0.85 }}>{label}</p>
    </div>
  );
}
