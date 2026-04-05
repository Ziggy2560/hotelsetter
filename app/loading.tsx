export default function RootLoading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-base leading-none">H</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand/40 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-brand/40 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-brand/40 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
