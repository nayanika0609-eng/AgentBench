export function SkeletonBlock({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-lg
        bg-ink-100/40
        dark:bg-white/5
        ${className}
      `}
      style={style}
    >
      <div
        className="
          absolute
          inset-0
          -translate-x-full
          animate-shimmer
        "
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent, rgba(139,92,246,0.16), transparent)',
          backgroundSize: '800px 100%',
        }}
      />
    </div>
  );
}


export function SkeletonCard() {
  return (
    <div className="panel p-5 space-y-3">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-7 w-16" />
      <SkeletonBlock className="h-2 w-32" />
    </div>
  );
}


export function SkeletonCardGrid({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-4
      "
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}


export function SkeletonChart({
  height = 280,
}: {
  height?: number;
}) {
  return (
    <div className="panel p-5">
      <SkeletonBlock className="h-4 w-40 mb-4" />

      <SkeletonBlock
        className="w-full"
        style={{ height }}
      />
    </div>
  );
}


export function SkeletonTable({
  rows = 5,
}: {
  rows?: number;
}) {
  return (
    <div className="panel p-5 space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className="h-9 w-full"
        />
      ))}
    </div>
  );
}


export function SkeletonList({
  rows = 3,
}: {
  rows?: number;
}) {
  return (
    <div className="space-y-3">

      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="
            panel
            p-4
            flex
            items-center
            gap-3
          "
        >

          <SkeletonBlock
            className="
              h-9
              w-9
              rounded-lg
              shrink-0
            "
          />

          <div className="flex-1 space-y-2">

            <SkeletonBlock
              className="h-3 w-1/3"
            />

            <SkeletonBlock
              className="h-2.5 w-1/2"
            />

          </div>

        </div>
      ))}

    </div>
  );
}