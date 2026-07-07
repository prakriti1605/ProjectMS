export default function FormCard({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4 w-full">
      <h2 className="text-foreground text-xl font-semibold">
        {title}
      </h2>

      {children}
    </div>
  );
}