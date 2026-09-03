// Purely decorative soft color wash behind the light UI.
export default function Blobs() {
  return (
    <>
      <div
        className="smrs-blob"
        style={{ width: 380, height: 380, top: -100, right: -80, background: "#6366F1", animation: "floatA 14s ease-in-out infinite" }}
      />
      <div
        className="smrs-blob"
        style={{ width: 340, height: 340, bottom: -120, left: -80, background: "#06B6D4", animation: "floatB 16s ease-in-out infinite" }}
      />
      <div
        className="smrs-blob"
        style={{ width: 260, height: 260, top: "38%", right: "22%", background: "#F59E0B", opacity: 0.1, animation: "floatA 20s ease-in-out infinite reverse" }}
      />
    </>
  );
}
