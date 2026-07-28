export default function StatCard({ title, value, icon: Icon }) {
  return (
    <div
      className="
        bg-card
        border
        border-border
        rounded-xl
        p-6
        hover:-translate-y-1
        hover:shadow-lg
        transition-all
      "
    >

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {value}
          </h3>
        </div>


        {Icon && (
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Icon size={24}/>
          </div>
        )}

      </div>

    </div>
  );
}