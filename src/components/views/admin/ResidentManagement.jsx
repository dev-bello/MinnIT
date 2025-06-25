import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, FilterIcon, HomeIcon, UserIcon, BuildingIcon, CheckCircleIcon, ClockIcon, XCircleIcon, CreditCardIcon } from 'lucide-react';
import { mockResidents } from '../../../contexts/AuthContext';

export const ResidentManagement = () => {
  const [residents, setResidents] = useState([
    ...mockResidents,
    // Add some pending residents for demonstration
    {
      id: '6',
      uniqueId: 'RES003',
      name: 'Michael Brown',
      email: 'michael@example.com',
      apartmentNumber: 'C-301',
      status: 'pending_payment',
      paymentAmount: 150.00,
      registrationDate: '2024-01-10T00:00:00Z',
      createdAt: '2024-01-10T00:00:00Z'
    },
    {
      id: '7',
      uniqueId: 'RES004',
      name: 'Sarah Davis',
      email: 'sarah@example.com',
      apartmentNumber: 'A-205',
      status: 'pending_approval',
      paymentAmount: 150.00,
      registrationDate: '2024-01-12T00:00:00Z',
      createdAt: '2024-01-12T00:00:00Z'
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [apartmentFilter, setApartmentFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    apartmentNumber: '',
    registrationType: 'admin_added' // admin_added or self_registered
  });

  const generateUniqueId = () => {
    const lastId = residents.length > 0 ? 
      Math.max(...residents.map(r => parseInt(r.uniqueId.replace('RES', '')))) : 0;
    return `RES${String(lastId + 1).padStart(3, '0')}`;
  };

  const handleAddResident = (e) => {
    e.preventDefault();
    const newResident = {
      id: Date.now().toString(),
      uniqueId: generateUniqueId(),
      name: formData.name,
      email: formData.email,
      apartmentNumber: formData.apartmentNumber,
      status: formData.registrationType === 'admin_added' ? 'active' : 'pending_payment',
      paymentAmount: formData.registrationType === 'self_registered' ? 150.00 : 0,
      registrationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    setResidents([...residents, newResident]);
    setFormData({ name: '', email: '', apartmentNumber: '', registrationType: 'admin_added' });
    setShowAddForm(false);
  };

  const handleApproveResident = (id) => {
    setResidents(residents.map(resident => 
      resident.id === id ? { ...resident, status: 'active' } : resident
    ));
  };

  const handleRejectResident = (id) => {
    setResidents(residents.map(resident => 
      resident.id === id ? { ...resident, status: 'rejected' } : resident
    ));
  };

  const handleDeleteResident = (id) => {
    setResidents(residents.filter(resident => resident.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_approval': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending_payment': return <CreditCardIcon className="w-4 h-4" />;
      case 'pending_approval': return <ClockIcon className="w-4 h-4" />;
      case 'rejected': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  // Filter residents based on search term, status, and apartment filter
  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || resident.status === statusFilter;
    
    const matchesApartment = !apartmentFilter || 
                            resident.apartmentNumber.toLowerCase().includes(apartmentFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesApartment;
  });

  // Get unique apartment blocks for filtering
  const apartmentBlocks = [...new Set(residents.map(r => r.apartmentNumber.charAt(0)))].sort();
  const statusOptions = ['active', 'pending_payment', 'pending_approval', 'rejected', 'suspended'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-6 shadow-soft border-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-soft">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-neutral-800">
                Resident Management
              </h2>
              <p className="text-neutral-600">Manage residents, approvals, and payment status</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="button-primary px-6 py-3 rounded-xl font-semibold"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Resident
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-neutral-600">Total</p>
                <p className="text-xl lg:text-2xl font-bold text-neutral-800">{residents.length}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <UserIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-neutral-600">Active</p>
                <p className="text-xl lg:text-2xl font-bold text-neutral-800">
                  {residents.filter(r => r.status === 'active').length}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-neutral-600">Pending Payment</p>
                <p className="text-xl lg:text-2xl font-bold text-neutral-800">
                  {residents.filter(r => r.status === 'pending_payment').length}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-neutral-600">Pending Approval</p>
                <p className="text-xl lg:text-2xl font-bold text-neutral-800">
                  {residents.filter(r => r.status === 'pending_approval').length}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <ClockIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-neutral-600">Revenue</p>
                <p className="text-lg lg:text-2xl font-bold text-neutral-800">
                  ${(residents.filter(r => r.paymentAmount).reduce((sum, r) => sum + (r.paymentAmount || 0), 0)).toFixed(0)}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search residents by name, email, ID, or apartment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern w-full pl-12"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FilterIcon className="text-neutral-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-modern min-w-[150px]"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={apartmentFilter}
                  onChange={(e) => setApartmentFilter(e.target.value)}
                  className="input-modern min-w-[150px]"
                >
                  <option value="">All Blocks</option>
                  {apartmentBlocks.map(block => (
                    <option key={block} value={block}>Block {block}</option>
                  ))}
                </select>
              </div>
              {(searchTerm || statusFilter || apartmentFilter) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setApartmentFilter('');
                  }}
                  variant="outline"
                  className="button-secondary"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-neutral-500">
            Showing {filteredResidents.length} of {residents.length} residents
          </div>
        </CardContent>
      </Card>

      {/* Add Form */}
      {showAddForm && (
        <Card className="glass-effect rounded-2xl shadow-soft border-0 animate-slide-down">
          <CardHeader>
            <h3 className="text-xl font-bold font-display text-neutral-800">Add New Resident</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddResident} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-modern w-full"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-modern w-full"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Apartment Number
                  </label>
                  <input
                    type="text"
                    value={formData.apartmentNumber}
                    onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                    className="input-modern w-full"
                    placeholder="e.g., A-101, B-205"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Registration Type
                  </label>
                  <select
                    value={formData.registrationType}
                    onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
                    className="input-modern w-full"
                  >
                    <option value="admin_added">Admin Added (Active Immediately)</option>
                    <option value="self_registered">Self Registered (Requires Payment)</option>
                  </select>
                </div>
              </div>
              
              {formData.registrationType === 'self_registered' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <CreditCardIcon className="w-5 h-5" />
                    <span className="font-semibold">Payment Required</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    This resident will need to complete a $150.00 payment before their account becomes active.
                    They will receive payment instructions via email.
                  </p>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button type="submit" className="button-primary px-6 py-3 rounded-xl font-semibold">
                  Add Resident
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="button-secondary px-6 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Residents Table */}
      <Card className="table-modern">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="table-header">
              <TableRow>
                <TableHead className="text-center font-semibold">ID</TableHead>
                <TableHead className="text-center font-semibold">Name</TableHead>
                <TableHead className="text-center font-semibold">Email</TableHead>
                <TableHead className="text-center font-semibold">Apartment</TableHead>
                <TableHead className="text-center font-semibold">Status</TableHead>
                <TableHead className="text-center font-semibold">Payment</TableHead>
                <TableHead className="text-center font-semibold">Registered</TableHead>
                <TableHead className="text-center font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.map((resident, index) => (
                <TableRow key={resident.id} className="table-row">
                  <TableCell className="text-center font-mono font-semibold text-primary-600">
                    {resident.uniqueId}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-neutral-800">
                    {resident.name}
                  </TableCell>
                  <TableCell className="text-center text-neutral-600">
                    {resident.email}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="status-badge bg-green-100 text-green-800 border-green-200">
                      {resident.apartmentNumber}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(resident.status)}
                      <span className={`status-badge ${getStatusColor(resident.status)}`}>
                        {(resident.status || 'active').replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {resident.paymentAmount ? (
                      <span className="text-sm font-semibold text-green-600">
                        ${resident.paymentAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-neutral-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-neutral-500">
                    {new Date(resident.registrationDate || resident.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {resident.status === 'pending_approval' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveResident(resident.id)}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-3 py-2"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleRejectResident(resident.id)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-2"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2">
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteResident(resident.id)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredResidents.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <HomeIcon className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-lg font-medium">No residents found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};