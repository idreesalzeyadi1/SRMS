import Card from "./Card";
import { Flame, Clock } from "lucide-react";

export default function CountdownBlock({ label, target, now }) {
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <Card title="Official Result Announcement" delay={0.05}>
      <div className="py-6 text-center space-y-5">
        {/* Red Animated Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-100 border border-red-300 text-red-600 font-extrabold text-lg sm:text-2xl animate-pulse tracking-wide shadow-sm">
          <Flame size={24} className="text-red-600 animate-bounce" />
          <span>{label || "Result Announcement Countdown"}</span>
        </div>

        {/* High Contrast Visible Timer Cards */}
        <div className="flex justify-center items-center gap-3 sm:gap-5 text-center pt-2">
          <div className="bg-slate-900 border-2 border-red-500 p-4 rounded-2xl min-w-[80px] shadow-lg">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 block">{days}</span>
            <p className="text-[11px] sm:text-xs font-bold text-gray-300 mt-1 uppercase">Days</p>
          </div>

          <div className="bg-slate-900 border-2 border-red-500 p-4 rounded-2xl min-w-[80px] shadow-lg">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 block">{hours}</span>
            <p className="text-[11px] sm:text-xs font-bold text-gray-300 mt-1 uppercase">Hours</p>
          </div>

          <div className="bg-slate-900 border-2 border-red-500 p-4 rounded-2xl min-w-[80px] shadow-lg">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 block">{mins}</span>
            <p className="text-[11px] sm:text-xs font-bold text-gray-300 mt-1 uppercase">Mins</p>
          </div>

          <div className="bg-slate-900 border-2 border-red-500 p-4 rounded-2xl min-w-[80px] shadow-lg">
            <span className="text-3xl sm:text-4xl font-black text-red-400 animate-pulse block">{secs}</span>
            <p className="text-[11px] sm:text-xs font-bold text-red-400 mt-1 uppercase">Secs</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 font-semibold flex items-center justify-center gap-1.5 pt-1">
          <Clock size={14} className="text-red-500" /> Scheduled result release. Results will be accessible automatically upon deadline.
        </p>
      </div>
    </Card>
  );
}