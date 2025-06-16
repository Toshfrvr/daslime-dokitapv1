import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 text-white">
      <div className="flex items-center justify-center gap-3">
        <Image
          src="/assets/icons/loader.svg"
          alt="Loading..."
          width={48}
          height={48}
          className="animate-spin"
        />
        <span className="animate-pulse text-lg font-medium tracking-wide">
          Loading...
        </span>
      </div>

      {/* Optional loading bar or hint text */}
      <p className="mt-2 text-sm text-slate-400">
        Preparing your experience. Please wait.
      </p>
    </div>
  );
}
