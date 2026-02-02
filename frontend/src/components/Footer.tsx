export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#292826] text-[10px] sm:text-xs text-center text-gray-400 py-2 sm:py-3 px-2">
      <span>© {new Date().getFullYear()} Motia. All rights reserved.</span>
    </footer>
  );
}

