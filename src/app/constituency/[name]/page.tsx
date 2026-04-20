'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Loader2, Trophy } from 'lucide-react';
import { useState } from 'react';
import YearDetailView from './year-detail-view';

interface Winner {
  candidate_name: string;
  party: string;
  votes: number;
  vote_share: string;
  year: number;
  district: string;
  constituency_no: string;
}

export default function ConstituencyPage() {
  const params = useParams();
  const rawName = params.name as string;
  const name = decodeURIComponent(rawName);
  const [selectedYear, setSelectedYear] = useState<number>(2021);

  const { data, isLoading, error } = useQuery({
    queryKey: ['constituency-winners', name],
    queryFn: async () => {
      const res = await fetch(`/api/constituency?name=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    },
  });

  const winners: Winner[] = data?.winners || [];

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!winners.length || error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold">Constituency not found or no data available.</h2>
      </div>
    );
  }

  const district = winners[0]?.district || '';
  const constituency_no = winners[0]?.constituency_no || '';

  const partyColors: Record<string, string> = {
    'DMK': '#dc2626',
    'AIADMK': '#16a34a',
    'ADMK': '#16a34a',
    'INC': '#0ea5e9',
    'BJP': '#f97316',
    'NTK': '#84cc16',
    'PMK': '#eab308',
    'MNM': '#ef4444',
    'DMDK': '#f43f5e',
    'IND': '#8b5cf6',
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl space-y-8">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-extrabold">{name.toUpperCase()}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          District: <span className="font-medium text-gray-800 dark:text-gray-200">{district}</span> • 
          Constituency No: <span className="font-medium text-gray-800 dark:text-gray-200">{constituency_no}</span>
        </p>
      </div>

      {/* Winners Cards - Vertical Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {winners.map((winner) => {
          const bgColor = partyColors[winner.party] || '#3b82f6';
          return (
            <div
              key={winner.year}
              className="relative overflow-hidden rounded-2xl shadow-lg border-2 transition-all hover:scale-105 hover:shadow-xl"
              style={{ borderColor: bgColor }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <Trophy className="w-full h-full" style={{ color: bgColor }} />
              </div>
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold" style={{ color: bgColor }}>
                    {winner.year}
                  </h3>
                  <Trophy className="w-6 h-6" style={{ color: bgColor }} />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Winner</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {winner.candidate_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Party</p>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mt-1"
                      style={{ backgroundColor: bgColor }}
                    >
                      {winner.party}
                    </span>
                  </div>
                  <div className="pt-2 border-t dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">{winner.votes.toLocaleString()}</span> votes
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="font-semibold">{winner.vote_share}%</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Year Tabs */}
      <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b dark:border-slate-800">
          <div className="flex">
            {[2011, 2016, 2021].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`flex-1 px-6 py-4 text-lg font-semibold transition-all ${
                  selectedYear === year
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {year} Election
              </button>
            ))}
          </div>
        </div>

        {/* Year Detail View */}
        <div className="p-6">
          <YearDetailView constituencyName={name} year={selectedYear} />
        </div>
      </div>
    </div>
  );
}
