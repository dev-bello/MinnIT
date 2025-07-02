import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  PlusIcon, 
  ShieldIcon, 
  UsersIcon, 
  HomeIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  UserPlusIcon,
  ClockIcon,
  TrendingUpIcon
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const AdminDashboard = () => {
  const { db, userProfile, currentEstate, createGuard, createResident } = useAuth();
  const [guards, setGuards] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddGuardModal, setShowAddGuardModal] = useState(false);
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [guardForm, setGuardForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shift_schedule: '',
    emergency_contact: '',
    address: ''
  });

  const [residentForm, setResidentForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    apartment_number: '',
    apartment_type: '',
    monthly_rent: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: ''
  });

  useEffect(() => {
    if (currentEstate) {
      loadData();
    }
  }, [currentEstate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [guardsData, residentsData] = await Promise.all([
        db.getGuards(currentEstate.id),
        db.getResidents(currentEstate.id)
      ]);
      setGuards(guardsData || []);
      setResidents(residentsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuard = async (e) => {
    e.preventDefault();
    try {
      await createGuard(guardForm);
      setGuardForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        shift_schedule: '',
        emergency_contact: '',
        address: ''
      });
      setShowAddGuardModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating guard:', error);
      alert('Error creating guard. Please try again.');
    }
  };

  const handleAddResident = async (e) => {
    e.preventDefault();
    try {
      await createResident({
        ...residentForm,
        monthly_rent: parseFloat(residentForm.monthly_rent) || 0
      });
      setResidentForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        apartment_number: '',
        apartment_type: '',
        monthly_rent: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: ''
      });
      setShowAddResidentModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating resident:', error);
      alert('Error creating resident. Please try again.');
    }
  };

  const handleDeleteGuard = async (id) => {
    if (confirm('Are you sure you want to delete this guard?')) {
      try {
        await db.deleteGuard(id);
        loadData();
      } catch (error) {
        console.error('Error deleting guard:', error);
        alert('Error deleting guard. Please try again.');
      }
    }
  };

  const handleDeleteResident = async (id) => {
    if (confirm('Are you sure you want to delete this resident?')) {
      try {
        await db.deleteResident(id);
        loadData();
      } catch (error) {
        console.error('Error deleting resident:', error);
        alert('Error deleting resident. Please try again.');
      }
    }
  };

  const stats = [
    { title: 'Total Guards', value: guards.length, icon: ShieldIcon, color: 'from-blue-500 to-blue-600' },
    { title: 'Active Guards', value: guards.filter(g => g.status === 'active').length, icon: ClockIcon, color: 'from-green-500 to-green-600' },
    { title: 'Total Residents', value: residents.length, icon: UsersIcon, color: 'from-purple-500 to-purple-600' },
    { title: 'Occupied Units', value: residents.filter(r => r.status === 'active').length, icon: HomeIcon, color: 'from-orange-500 to-orange-600' },
  ];

  const shiftOptions = [
    'Morning (6AM - 2PM)',
    'Evening (2PM - 10PM)',
    'Night (10PM - 6AM)'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-spin"></div>
            <div className="text-neutral-600 font-medium">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6 shadow-soft border-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-soft">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-neutral-800">
                Estate Management
              </h2>
              <p className="text-neutral-600">{currentEstate?.name} - Admin Dashboard</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddGuardModal(true)}
              className="button-primary"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Guard
            </Button>
            <Button
              onClick={() => setShowAddResidentModal(true)}
              className="button-primary"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Resident
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="metric-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="glass-effect rounded-2xl shadow-soft border-0">
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('guards')}
            className={`px-6 py-4 font-semibold transition-colors ${
              activeTab === 'guards' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Guards ({guards.length})
          </button>
          <button
            onClick={() => setActiveTab('residents')}
            className={`px-6 py-4 font-semibold transition-colors ${
              activeTab === 'residents' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Residents ({residents.length})
          </button>
        </div>

        <div className="p-6">
          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {(searchTerm || statusFilter) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                  variant="outline"
                  className="button-secondary"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Guards Table */}
          {activeTab === 'guards' && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="table-header">
                  <TableRow>
                    <TableHead className="text-center font-semibold">Guard ID</TableHead>
                    <TableHead className="text-center font-semibold">Name</TableHead>
                    <TableHead className="text-center font-semibold">Email</TableHead>
                    <TableHead className="text-center font-semibold">Shift</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                    <TableHead className="text-center font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guards
                    .filter(guard => {
                      const matchesSearch = guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           guard.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           guard.unique_id.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = !statusFilter || guard.status === statusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((guard) => (
                      <TableRow key={guard.id} className="table-row">
                        <TableCell className="text-center font-mono font-semibold text-primary-600">
                          {guard.unique_id}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-neutral-800">
                          {guard.name}
                        </TableCell>
                        <TableCell className="text-center text-neutral-600">
                          {guard.email}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {guard.shift_schedule}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={
                            guard.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          }>
                            {guard.status?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              className="button-table-action bg-blue-500 hover:bg-blue-600"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="button-table-action bg-green-500 hover:bg-green-600"
                            >
                              <EditIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDeleteGuard(guard.id)}
                              className="button-table-action bg-red-500 hover:bg-red-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Residents Table */}
          {activeTab === 'residents' && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="table-header">
                  <TableRow>
                    <TableHead className="text-center font-semibold">Resident ID</TableHead>
                    <TableHead className="text-center font-semibold">Name</TableHead>
                    <TableHead className="text-center font-semibold">Email</TableHead>
                    <TableHead className="text-center font-semibold">Apartment</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                    <TableHead className="text-center font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents
                    .filter(resident => {
                      const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           resident.unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           resident.apartment_number.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = !statusFilter || resident.status === statusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((resident) => (
                      <TableRow key={resident.id} className="table-row">
                        <TableCell className="text-center font-mono font-semibold text-primary-600">
                          {resident.unique_id}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-neutral-800">
                          {resident.name}
                        </TableCell>
                        <TableCell className="text-center text-neutral-600">
                          {resident.email}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {resident.apartment_number}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={
                            resident.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          }>
                            {resident.status?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              className="button-table-action bg-blue-500 hover:bg-blue-600"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="button-table-action bg-green-500 hover:bg-green-600"
                            >
                              <EditIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDeleteResident(resident.id)}
                              className="button-table-action bg-red-500 hover:bg-red-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Add Guard Modal */}
      <Modal
        isOpen={showAddGuardModal}
        onClose={() => setShowAddGuardModal(false)}
        title="Add New Guard"
        size="lg"
      >
        <form onSubmit={handleAddGuard} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={guardForm.name}
                onChange={(e) => setGuardForm({ ...guardForm, name: e.target.value })}
                className="input-modern w-full"
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={guardForm.email}
                onChange={(e) => setGuardForm({ ...guardForm, email: e.target.value })}
                className="input-modern w-full"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={guardForm.password}
                onChange={(e) => setGuardForm({ ...guardForm, password: e.target.value })}
                className="input-modern w-full"
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={guardForm.phone}
                onChange={(e) => setGuardForm({ ...guardForm, phone: e.target.value })}
                className="input-modern w-full"
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Shift Schedule *
            </label>
            <select
              value={guardForm.shift_schedule}
              onChange={(e) => setGuardForm({ ...guardForm, shift_schedule: e.target.value })}
              className="input-modern w-full"
              required
            >
              <option value="">Select Shift</option>
              {shiftOptions.map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                value={guardForm.emergency_contact}
                onChange={(e) => setGuardForm({ ...guardForm, emergency_contact: e.target.value })}
                className="input-modern w-full"
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={guardForm.address}
                onChange={(e) => setGuardForm({ ...guardForm, address: e.target.value })}
                className="input-modern w-full"
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="button-primary">
              Add Guard
            </Button>
            <Button 
              type="button" 
              onClick={() => setShowAddGuardModal(false)} 
              variant="outline" 
              className="button-secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Resident Modal */}
      <Modal
        isOpen={showAddResidentModal}
        onClose={() => setShowAddResidentModal(false)}
        title="Add New Resident"
        size="lg"
      >
        <form onSubmit={handleAddResident} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={residentForm.name}
                onChange={(e) => setResidentForm({ ...residentForm, name: e.target.value })}
                className="input-modern w-full"
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={residentForm.email}
                onChange={(e) => setResidentForm({ ...residentForm, email: e.target.value })}
                className="input-modern w-full"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={residentForm.password}
                onChange={(e) => setResidentForm({ ...residentForm, password: e.target.value })}
                className="input-modern w-full"
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={residentForm.phone}
                onChange={(e) => setResidentForm({ ...residentForm, phone: e.target.value })}
                className="input-modern w-full"
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Apartment Number *
              </label>
              <input
                type="text"
                value={residentForm.apartment_number}
                onChange={(e) => setResidentForm({ ...residentForm, apartment_number: e.target.value })}
                className="input-modern w-full"
                placeholder="e.g., A-101"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Apartment Type
              </label>
              <input
                type="text"
                value={residentForm.apartment_type}
                onChange={(e) => setResidentForm({ ...residentForm, apartment_type: e.target.value })}
                className="input-modern w-full"
                placeholder="e.g., 2 Bedroom"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Monthly Rent (₦)
              </label>
              <input
                type="number"
                value={residentForm.monthly_rent}
                onChange={(e) => setResidentForm({ ...residentForm, monthly_rent: e.target.value })}
                className="input-modern w-full"
                placeholder="150000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={residentForm.emergency_contact_name}
                onChange={(e) => setResidentForm({ ...residentForm, emergency_contact_name: e.target.value })}
                className="input-modern w-full"
                placeholder="Contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={residentForm.emergency_contact_phone}
                onChange={(e) => setResidentForm({ ...residentForm, emergency_contact_phone: e.target.value })}
                className="input-modern w-full"
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Relationship
              </label>
              <input
                type="text"
                value={residentForm.emergency_contact_relation}
                onChange={(e) => setResidentForm({ ...residentForm, emergency_contact_relation: e.target.value })}
                className="input-modern w-full"
                placeholder="e.g., Spouse, Parent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="button-primary">
              Add Resident
            </Button>
            <Button 
              type="button" 
              onClick={() => setShowAddResidentModal(false)} 
              variant="outline" 
              className="button-secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};