export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1320px] mx-auto px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo + brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm leading-none">H</span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-text">
            HotelSetter
          </span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-text-faint">&copy; {new Date().getFullYear()} HotelSetter. All rights reserved.</p>

        {/* Domain */}
        <p className="text-sm text-text-muted">hotelsetter.com</p>
      </div>
    </footer>
  );
}
