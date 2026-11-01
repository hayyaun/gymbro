export default function ExirBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`exir-brand${compact ? " exir-brand-compact" : ""}`}>
      <img
        src={`${import.meta.env.BASE_URL}exir-gym-logo.png`}
        alt="EXIR GYM — Discipline · Performance · Lifestyle"
        width="1774"
        height="888"
      />
    </div>
  );
}
