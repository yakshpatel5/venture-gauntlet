function Bone({ className }: { className: string }) {
  return (
    <div
      className={`bg-sidebar/80 rounded animate-pulse ${className}`}
    />
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      {/* Top card — gauge + metrics */}
      <div className="bg-white border border-sidebar rounded-xl p-5 shadow-sm flex items-center gap-6">
        {/* Gauge placeholder */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <div className="w-48 h-28 bg-sidebar/60 rounded-xl animate-pulse" />
          <Bone className="w-28 h-8 rounded-full" />
        </div>
        {/* Metrics placeholder */}
        <div className="flex-1 space-y-2">
          <Bone className="w-32 h-3 mb-3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-sidebar/40 rounded-lg px-3 py-2 space-y-1.5">
              <Bone className="w-36 h-3" />
              <Bone className="w-full h-2.5" />
              <Bone className="w-20 h-2.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Tab panel placeholder */}
      <div className="bg-white border border-sidebar rounded-xl shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-sidebar px-1 pt-1 gap-1">
          {[80, 60, 90, 70].map((w, i) => (
            <Bone key={i} className={`w-${w === 80 ? 20 : w === 60 ? 16 : w === 90 ? 24 : 18} h-9 rounded-t-lg`} />
          ))}
        </div>
        {/* Content */}
        <div className="p-5 space-y-3">
          <Bone className="w-48 h-4" />
          <Bone className="w-full h-24 rounded-lg" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <Bone key={i} className="h-16 rounded-lg" />
            ))}
          </div>
          <Bone className="w-full h-12 rounded-lg" />
          <Bone className="w-3/4 h-3" />
          <Bone className="w-full h-3" />
          <Bone className="w-5/6 h-3" />
        </div>
      </div>
    </div>
  );
}
