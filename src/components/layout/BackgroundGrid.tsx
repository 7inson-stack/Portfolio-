export default function BackgroundGrid({
  theme = "light",
}: {
  theme?: "light" | "dark";
}) {
  const borderClass =
    theme === "light"
      ? "border-grid-line-light"
      : "border-grid-line-dark";

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="grid size-full grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
        <div className={`relative h-full border-x border-solid ${borderClass}`} />
        <div className={`relative h-full border-x border-solid ${borderClass}`} />
        <div className={`relative h-full border-x border-solid ${borderClass}`} />
        <div className={`relative h-full border-x border-solid ${borderClass}`} />
        <div className={`relative h-full border-x border-solid ${borderClass} hidden sm:block`} />
        <div className={`relative h-full border-x border-solid ${borderClass} hidden sm:block`} />
        <div className={`relative h-full border-x border-solid ${borderClass} hidden md:block`} />
        <div className={`relative h-full border-x border-solid ${borderClass} hidden md:block`} />
        <div className={`relative h-full border-x border-solid ${borderClass} hidden lg:block`} />
        <div className={`relative h-full border-x border-solid ${borderClass} hidden lg:block`} />
        <div className={`relative h-full border-x border-solid ${borderClass} hidden xl:block`} />
        <div className={`relative h-full border-x border-solid ${borderClass} hidden xl:block`} />
      </div>
    </div>
  );
}
