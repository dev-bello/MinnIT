import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../lib/supabase';
import { UsersIcon, ShieldIcon, HomeIcon, RefreshCwIcon } from 'lucide-react';

export const SuperAdminDashboard = () => {
  const { userProfile } = useAuth();
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [estates, setEstates] = useState([]);
  const [totals, setTotals] = useState({ estates: 0, residents: 0, guards: 0 });
  const [estateForm, setEstateForm] = useState({
    name: '',
    subdomain: '',
    address: '',
    city: '',
    state: '',
    country: '',
    contact_email: '',
    contact_phone: ''
  });
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [drafts, setDrafts] = useState([]);

  const DRAFTS_KEY = 'estate_drafts';
  const readDrafts = () => {
    try {
      return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    } catch {
      return [];
    }
  };
  const writeDrafts = (next) => {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
  };
  const openDrafts = () => {
    setDrafts(readDrafts());
    setIsDraftsOpen(true);
  };
  const saveDraft = () => {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    const next = [{ id, createdAt, estateForm, adminForm }, ...readDrafts()].slice(0, 50);
    writeDrafts(next);
    setSuccessMsg('Draft saved locally');
  };
  const deleteDraft = (id) => {
    const next = readDrafts().filter(d => d.id !== id);
    writeDrafts(next);
    setDrafts(next);
  };
  const loadDraft = (id) => {
    const d = readDrafts().find(x => x.id === id);
    if (!d) return;
    setEstateForm(d.estateForm || {});
    setAdminForm(d.adminForm || {});
    setIsDraftsOpen(false);
    setSuccessMsg('Draft loaded');
  };

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      setStatsError('');
      const data = await db.getEstates();
      setEstates(Array.isArray(data) ? data : []);
      const totalsCalc = (data || []).reduce((acc, est) => {
        acc.estates += 1;
        acc.residents += est.residents?.[0]?.count || 0;
        acc.guards += est.guards?.[0]?.count || 0;
        return acc;
      }, { estates: 0, residents: 0, guards: 0 });
      setTotals(totalsCalc);
    } catch (err) {
      setStatsError('Failed to load totals');
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleEstateChange = (e) => {
    setEstateForm({ ...estateForm, [e.target.name]: e.target.value });
  };
  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg('Estate and admin created successfully!');
        setEstateForm({
          name: '', subdomain: '', address: '', city: '', state: '', country: '', contact_email: '', contact_phone: ''
        });
        setAdminForm({ name: '', email: '', phone: '', password: '' });
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Failed to create estate/admin.');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-neutral-50">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-neutral-900">
              Super Admin <span className="text-neutral-500 font-semibold">Dashboard</span>
            </h1>
            <p className="text-neutral-500 mt-2">Manage estates, administrators, and view platform totals.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadStats} variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-100">
              <RefreshCwIcon className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button onClick={openDrafts} variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-100">
              View Drafts
            </Button>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-6xl mx-auto mb-6">
        <Card className="bg-white border border-neutral-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-neutral-500">Total Estates</div>
              <div className="text-2xl font-bold text-neutral-900">{totals.estates}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-neutral-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-neutral-500">Total Residents</div>
              <div className="text-2xl font-bold text-neutral-900">{totals.residents}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-neutral-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
              <ShieldIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-neutral-500">Total Guards</div>
              <div className="text-2xl font-bold text-neutral-900">{totals.guards}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estates table */}
      <div className="max-w-6xl mx-auto mb-8">
        <Card className="bg-white border border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <h2 className="text-xl font-bold text-neutral-900">Estates Overview</h2>
            <Button onClick={loadStats} variant="outline" className="text-neutral-700 border-neutral-300 hover:bg-neutral-100">
              <RefreshCwIcon className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {statsError && <div className="text-sm text-red-600 mb-3">{statsError}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-neutral-500">
                  <tr>
                    <th className="text-left py-2 pr-4">Estate</th>
                    <th className="text-left py-2 pr-4">City</th>
                    <th className="text-left py-2 pr-4">Residents</th>
                    <th className="text-left py-2 pr-4">Guards</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-800">
                  {estates.map((e) => (
                    <tr key={e.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                      <td className="py-2 pr-4 font-medium">{e.name}</td>
                      <td className="py-2 pr-4"><span className="px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs">{e.city || '-'}</span></td>
                      <td className="py-2 pr-4">{e.residents?.[0]?.count || 0}</td>
                      <td className="py-2 pr-4">{e.guards?.[0]?.count || 0}</td>
                    </tr>
                  ))}
                  {estates.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-neutral-500">No estates yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create estate & admin */}
      <div className="max-w-2xl mx-auto">
        <Card className="w-full bg-white border border-neutral-200 shadow-sm">
          <CardHeader className="text-center pb-6">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">
              Create Estate & Admin
            </h1>
            <p className="text-neutral-500">Add a new estate and its designated admin</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">Estate Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" value={estateForm.name} onChange={handleEstateChange} className="input-modern" placeholder="Estate Name" required />
                  <input name="subdomain" value={estateForm.subdomain} onChange={handleEstateChange} className="input-modern" placeholder="Subdomain (e.g. estateA)" required />
                  <input name="address" value={estateForm.address} onChange={handleEstateChange} className="input-modern" placeholder="Address" required />
                  <input name="city" value={estateForm.city} onChange={handleEstateChange} className="input-modern" placeholder="City" required />
                  <input name="state" value={estateForm.state} onChange={handleEstateChange} className="input-modern" placeholder="State" required />
                  <input name="country" value={estateForm.country} onChange={handleEstateChange} className="input-modern" placeholder="Country" required />
                  <input name="contact_email" value={estateForm.contact_email} onChange={handleEstateChange} className="input-modern" placeholder="Contact Email" required />
                  <input name="contact_phone" value={estateForm.contact_phone} onChange={handleEstateChange} className="input-modern" placeholder="Contact Phone" required />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">Admin Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" value={adminForm.name} onChange={handleAdminChange} className="input-modern" placeholder="Admin Name" required />
                  <input name="email" value={adminForm.email} onChange={handleAdminChange} className="input-modern" placeholder="Admin Email" required />
                  <input name="phone" value={adminForm.phone} onChange={handleAdminChange} className="input-modern" placeholder="Admin Phone" required />
                  <input name="password" type="password" value={adminForm.password} onChange={handleAdminChange} className="input-modern" placeholder="Temporary Password" required />
                </div>
              </div>
              {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{successMsg}</div>}
              {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{errorMsg}</div>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={saveDraft} className="border-neutral-300 text-neutral-700 hover:bg-neutral-100">Save Draft</Button>
                <Button type="submit" disabled={isLoading} className="flex-1 py-3 text-base font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-all duration-200">
                  {isLoading ? 'Creating...' : 'Create Estate & Admin'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Drafts Modal */}
      <Modal isOpen={isDraftsOpen} onClose={() => setIsDraftsOpen(false)} size="md" title="Drafts" align="start">
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          {drafts.length === 0 ? (
            <div className="text-neutral-500">No drafts yet</div>
          ) : (
            <div className="space-y-3">
              {drafts.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl">
                  <div className="text-sm">
                    <div className="font-semibold text-neutral-800">{d.estateForm?.name || 'Untitled Estate'}</div>
                    <div className="text-neutral-500">{new Date(d.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => loadDraft(d.id)} className="border-neutral-300 text-neutral-700 hover:bg-neutral-100">Load</Button>
                    <Button variant="outline" onClick={() => deleteDraft(d.id)} className="border-red-200 text-red-700 hover:bg-red-50">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}; 