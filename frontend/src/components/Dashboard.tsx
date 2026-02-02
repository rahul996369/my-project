import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <main className="flex-1 flex items-center justify-center bg-[#292826] text-[#F9D342] px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="max-w-lg w-full mx-auto p-4 sm:p-6 md:p-10 rounded-lg sm:rounded-xl border border-[#F9D342]/40 bg-[#292826] shadow-lg flex flex-col items-center gap-3 sm:gap-4">
        <p className="text-xs sm:text-sm md:text-base text-gray-300 text-center">
          Start a new conversation with the assistant. Click below to open the
          chat interface.
        </p>
        <Link
          to="/chat"
          className="mt-2 w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-[#F9D342] bg-[#F9D342] px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-[#292826] hover:bg-[#e6bf3b] transition-colors"
        >
          Open Chat
        </Link>
      </div>
    </main>
  );
}

