import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { db } from '../../../lib/supabase';
import { RefreshCwIcon, SearchIcon, FilterIcon } from 'lucide-react';

export const SuperAdminEstates = () => {
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [regStart, setRegStart] = useState('');
  const [regEnd, setRegEnd] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await db.getEstates();
      setEstates(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load estates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const startReg = regStart ? new Date(regStart) : null;
    const endReg = regEnd ? new Date(regEnd) : null;
    const startExp = expStart ? new Date(expStart) : null;
    const endExp = expEnd ? new Date(expEnd) : null;

    return (estates || []).filter((e) => {
      const matchesSearch = !s || (e.name || '').toLowerCase().includes(s) || (e.city || '').toLowerCase().includes(s) || (e.state || '').toLowerCase().includes(s);

      const createdAt = e.created_at ? new Date(e.created_at) : null;
      const inRegRange = (!startReg || (createdAt && createdAt >= startReg)) && (!endReg || (createdAt && createdAt <= endReg));

      const expiry = e.expiry_date ? new Date(e.expiry_date) : null; // optional
      const inExpRange = (!startExp || (expiry && expiry >= startExp)) && (!endExp || (expiry && expiry <= endExp));

      return matchesSearch && inRegRange && inExpRange;
    });
  }, [estates, search, regStart, regEnd, expStart, expEnd]);

  const resetFilters = () => {
    setSearch('');
    setRegStart('');
    setRegEnd('');
    setExpStart('');
    setExpEnd('');
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Estates</h2>
          <p className="text-neutral-500 text-sm">Totals and filters by registration/expiry date.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={load} variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 shrink-0" disabled={loading}>
            <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-white border border-neutral-200">
        <CardHeader className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <div className="flex items-center gap-2 w-full">
                <SearchIcon className="w-4 h-4 text-neutral-400 hidden sm:block" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name/city/state"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <div className="flex items-center gap-2 w-full">
                <FilterIcon className="w-4 h-4 text-neutral-400 hidden sm:block" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full text-sm">
                  <span className="text-neutral-500">Reg:</span>
                  <input type="date" value={regStart} onChange={(e) => setRegStart(e.target.value)} className="w-full sm:w-auto flex-1 px-2 py-2 rounded-lg border border-neutral-300" />
                  <span className="text-neutral-500">to</span>
                  <input type="date" value={regEnd} onChange={(e) => setRegEnd(e.target.value)} className="w-full sm:w-auto flex-1 px-2 py-2 rounded-lg border border-neutral-300" />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <div className="flex items-center gap-2 w-full">
                <FilterIcon className="w-4 h-4 text-neutral-400 hidden sm:block" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full text-sm">
                  <span className="text-neutral-500">Expiry:</span>
                  <input type="date" value={expStart} onChange={(e) => setExpStart(e.target.value)} className="w-full sm:w-auto flex-1 px-2 py-2 rounded-lg border border-neutral-300" />
                  <span className="text-neutral-500">to</span>
                  <input type="date" value={expEnd} onChange={(e) => setExpEnd(e.target.value)} className="w-full sm:w-auto flex-1 px-2 py-2 rounded-lg border border-neutral-300" />
                </div>
              </div>
            </div>
            <div className="flex items-stretch sm:items-center gap-2 w-full">
              <Button variant="outline" className="w-full sm:w-auto border-neutral-300 text-neutral-700 hover:bg-neutral-100" onClick={resetFilters}>Reset</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-neutral-500">
                <tr>
                  <th className="text-left py-2 pr-4">Estate</th>
                  <th className="text-left py-2 pr-4">City</th>
                  <th className="text-left py-2 pr-4">Registered</th>
                  <th className="text-left py-2 pr-4">Expiry</th>
                  <th className="text-left py-2 pr-4">Residents</th>
                  <th className="text-left py-2 pr-4">Guards</th>
                </tr>
              </thead>
              <tbody className="text-neutral-800">
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                    <td className="py-2 pr-4 font-medium">{e.name}</td>
                    <td className="py-2 pr-4">{e.city || '-'}</td>
                    <td className="py-2 pr-4">{e.created_at ? new Date(e.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-2 pr-4">{e.expiry_date ? new Date(e.expiry_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 pr-4">{e.residents?.[0]?.count || 0}</td>
                    <td className="py-2 pr-4">{e.guards?.[0]?.count || 0}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-neutral-500">No estates match your filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
