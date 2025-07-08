import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';

export const SuperAdminDashboard = () => {
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
      // TODO: Implement estate and admin creation logic (call backend/db)
      // For now, just simulate success
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-300 font-medium">Add a new estate and its first admin</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Estate Details</h2>
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
              <h2 className="text-xl font-semibold text-white mb-4">Admin Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={adminForm.name} onChange={handleAdminChange} className="input-modern" placeholder="Admin Name" required />
                <input name="email" value={adminForm.email} onChange={handleAdminChange} className="input-modern" placeholder="Admin Email" required />
                <input name="phone" value={adminForm.phone} onChange={handleAdminChange} className="input-modern" placeholder="Admin Phone" required />
                <input name="password" type="password" value={adminForm.password} onChange={handleAdminChange} className="input-modern" placeholder="Temporary Password" required />
              </div>
            </div>
            {successMsg && <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl text-sm animate-slide-down backdrop-blur-sm">{successMsg}</div>}
            {errorMsg && <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm animate-slide-down backdrop-blur-sm">{errorMsg}</div>}
            <Button type="submit" disabled={isLoading} className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg">
              {isLoading ? 'Creating...' : 'Create Estate & Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 