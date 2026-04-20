'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, Trophy, AlertTriangle, GraduationCap, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useMemo } from 'react';

interface Candidate {
  id: number;
  candidate_name: string;
  party: string;
  votes: number;
  vote_share: string;
  district: string;
  constituency_no: string;
  education?: string;
  criminal_cases?: number;
  assets?: number;
  year: number;
  [key: string]: any;
}

interface YearDetailViewProps {
  constituencyName: string;
  year: number;
}

export default function YearDetailView({ constituencyName, year }: YearDetailViewProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['constituency-year', constituencyName, year],
    queryFn: async () => {
      const res = await fetch(
        `/api/constituency?name=${encodeURIComponent(constituencyName)}&year=${year}`
      );
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    },
  });

  const candidates: Candidate[] = data?.candidates || [];

  const winner = useMemo(() => {
    if (candidates.length === 0) return null;
    
    let best: Candidate | null = null;
    let maxVotes = -Infinity;

    candidates.forEach((c: any) => {
      const votes = c.votes || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        best = c;
      }
    });

    return best;
  }, [candidates]);

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!candidates.length || error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-500">No data available for {year}</h2>
      </div>
    );
  }

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
  const fallbackColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'];

  const chartData = candidates.slice(0, 5).map((c: any, index: number) => ({
    name: c.candidate_name,
    votes: c.votes,
    party: c.party,
    fill: partyColors[c.party] || fallbackColors[index % fallbackColors.length]
  }));

  return (
    <div className="space-y-8">
      {winner && (
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-500 opacity-20">
            <Trophy className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h2 className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4" /> Winner Candidate Profile
            </h2>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{winner.candidate_name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800 dark:bg-amber-800/50 dark:text-amber-200 mt-2">
                  {winner.party}
                </span>
                <div className="mt-4 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="font-medium">{winner.criminal_cases || 0} Criminal Cases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{winner.education || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="font-medium">{winner.vote_share}% Vote Share</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Top Candidates by Votes</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Vote Share Distribution</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="votes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-lg mb-6">All Candidates List</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-slate-800 text-sm text-gray-500">
              <th className="py-3 px-4 font-medium">Candidate</th>
              <th className="py-3 px-4 font-medium">Party</th>
              <th className="py-3 px-4 font-medium">Votes</th>
              <th className="py-3 px-4 font-medium">Education</th>
              <th className="py-3 px-4 font-medium">Criminal Cases</th>
              <th className="py-3 px-4 font-medium">Assets</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c: any) => (
              <tr key={c.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-4 px-4 font-medium">{c.candidate_name}</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800">
                    {c.party}
                  </span>
                </td>
                <td className="py-4 px-4">{c.votes.toLocaleString()} ({c.vote_share}%)</td>
                <td className="py-4 px-4">{c.education || '-'}</td>
                <td className="py-4 px-4 text-center">
                  {c.criminal_cases > 0 ? (
                    <span className="text-red-500 font-bold">{c.criminal_cases}</span>
                  ) : c.criminal_cases === 0 ? '0' : '-'}
                </td>
                <td className="py-4 px-4">
                  {c.assets ? `₹${(c.assets / 10000000).toFixed(2)} Cr` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
