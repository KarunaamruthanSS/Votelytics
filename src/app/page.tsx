import { SearchBar } from "@/components/search-bar";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-4xl space-y-8 text-center">
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Constituency Intelligence
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Analyze the 2021 Tamil Nadu Assembly Election Data. Discover candidates, vote shares, criminal backgrounds, and assets instantly.
          </p>
        </div>

        <div className="pt-8">
          <SearchBar />
        </div>
        
        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur border shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Detailed Candidates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View complete candidate details including education, assets, and liabilities merged from official affidavits.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur border shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Vote Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analyze vote share, margins, and turnout visually with beautiful interactive charts.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur border shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Best Candidates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Our engine highlights the strongest candidate based on clean background, education, and public mandate.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
