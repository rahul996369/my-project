import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 bg-[#292826] text-[#F9D342]">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between">
        <Link to="/" className="text-base sm:text-lg md:text-xl font-semibold truncate">
          Welcome Rahul
        </Link>
        <nav className="flex gap-2 sm:gap-4 text-xs sm:text-sm">
          <Link to="/" className="hover:underline whitespace-nowrap">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

