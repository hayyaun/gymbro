// Show the central wordmark from the supplied artwork, excluding its outer ring.
export default function ExirBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`exir-brand${compact ? " exir-brand-compact" : ""}`}>
      <img
        src={`${import.meta.env.BASE_URL}exir-gym.jpg`}
        alt="EXIR GYM — Discipline · Performance · Lifestyle"
        width="1080"
        height="1080"
      />
    </div>
  );
}
