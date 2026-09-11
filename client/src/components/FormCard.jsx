export default function FormCard({ title, description, children }) {
  return (
    <div className="w-full">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Welcome</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}