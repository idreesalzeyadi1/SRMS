export default function Card({ title, children, delay = 0 }) {
  return (
    <section className="smrs-glass smrs-fade p-5" style={{ animationDelay: `${delay}s` }}>
      <h3 className="text-sm mb-4" style={{ fontWeight: 600, color: "var(--text-soft)" }}>{title}</h3>
      {children}
    </section>
  );
}
