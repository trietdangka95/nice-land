export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      data-reveal="soft"
      className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-balance font-display text-3xl font-medium leading-[1.08] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && <p className="mt-5 text-base leading-7 text-current opacity-70">{description}</p>}
    </div>
  );
}
