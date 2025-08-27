import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  PlusIcon, 
  BuildingIcon, 
  UsersIcon, 
  ShieldIcon, 
  EyeIcon,
  MapPinIcon,
  CalendarIcon,
  TrendingUpIcon,
  SearchIcon,
  FilterIcon
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const DeveloperDashboard = () => {
  const { db, userProfile } = useAuth();
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEstateModal, setShowAddEstateModal] = useState(false);
  const [selectedEstate, setSelectedEstate] = useState(null);
  const [showEstateDetailsModal, setShowEstateDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [estateForm, setEstateForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    total_units: '',
    contact_email: '',
    contact_phone: ''
  });

  useEffect(() => {
    loadEstates();
  }, []);

  const loadEstates = async () => {
    try {
      setLoading(true);
      const data = await db.getEstates();
      setEstates(data || []);
    } catch (error) {
      console.error('Error loading estates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEstate = async (e) => {
    e.preventDefault();
    try {
      await db.createEstate({
        ...estateForm,
        total_units: parseInt(estateForm.total_units) || 0
      });
      
      setEstateForm({
        name: '',
        address: '',
        city: '',
        state: '',
        country: 'Nigeria',
        total_units: '',
        contact_email: '',
        contact_phone: ''
      });
      setShowAddEstateModal(false);
      loadEstates();
    } catch (error) {
      console.error('Error creating estate:', error);
      alert('Error creating estate. Please try again.');
    }
  };

  const handleViewEstate = (estate) => {
    setSelectedEstate(estate);
    setShowEstateDetailsModal(true);
  };

  const filteredEstates = estates.filter(estate => {
    const matchesSearch = estate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estate.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estate.unique_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || estate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalResidents = estates.reduce((sum, estate) => sum + (estate.residents?.[0]?.count || 0), 0);
  const totalGuards = estates.reduce((sum, estate) => sum + (estate.guards?.[0]?.count || 0), 0);
  const totalUnits = estates.reduce((sum, estate) => sum + (estate.total_units || 0), 0);

  const stats = [
    { title: 'Total Estates', value: estates.length, icon: BuildingIcon, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Residents', value: totalResidents, icon: UsersIcon, color: 'from-green-500 to-green-600' },
    { title: 'Total Guards', value: totalGuards, icon: ShieldIcon, color: 'from-purple-500 to-purple-600' },
    { title: 'Total Units', value: totalUnits, icon: TrendingUpIcon, color: 'from-orange-500 to-orange-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-spin"></div>
            <div className="text-neutral-600 font-medium">Loading your estates...</div>
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
              <BuildingIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-neutral-800">
                Developer Dashboard
              </h2>
              <p className="text-neutral-600">Manage your registered estates and view analytics</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddEstateModal(true)}
            className="button-primary"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Register New Estate
          </Button>
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

      {/* Search and Filter */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search estates by name, city, or ID..."
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
                  <option value="pending">Pending</option>
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
          <div className="mt-4 text-sm text-neutral-500">
            Showing {filteredEstates.length} of {estates.length} estates
          </div>
        </CardContent>
      </Card>

      {/* Estates Table */}
      <Card className="table-modern">
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-800 font-display">
            Registered Estates
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="text-center font-semibold">Estate ID</TableHead>
                  <TableHead className="text-center font-semibold">Name</TableHead>
                  <TableHead className="text-center font-semibold">Location</TableHead>
                  <TableHead className="text-center font-semibold">Units</TableHead>
                  <TableHead className="text-center font-semibold">Residents</TableHead>
                  <TableHead className="text-center font-semibold">Guards</TableHead>
                  <TableHead className="text-center font-semibold">Status</TableHead>
                  <TableHead className="text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstates.map((estate) => (
                  <TableRow key={estate.id} className="table-row">
                    <TableCell className="text-center font-mono font-semibold text-primary-600">
                      {estate.unique_id}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-neutral-800">
                      {estate.name}
                    </TableCell>
                    <TableCell className="text-center text-neutral-600">
                      {estate.city}, {estate.state}
                    </TableCell>
                    <TableCell className="text-center text-neutral-600">
                      {estate.occupied_units || 0}/{estate.total_units || 0}
                    </TableCell>
                    <TableCell className="text-center text-neutral-600">
                      {estate.residents?.[0]?.count || 0}
                    </TableCell>
                    <TableCell className="text-center text-neutral-600">
                      {estate.guards?.[0]?.count || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={
                        estate.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                        estate.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }>
                        {estate.status?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        onClick={() => handleViewEstate(estate)}
                        className="button-table-action bg-blue-500 hover:bg-blue-600"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredEstates.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <BuildingIcon className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-lg font-medium">No estates found</p>
              <p className="text-sm">Register your first estate to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Estate Modal */}
      <Modal
        isOpen={showAddEstateModal}
        onClose={() => setShowAddEstateModal(false)}
        title="Register New Estate"
        size="lg"
      >
        <form onSubmit={handleAddEstate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Estate Name *
              </label>
              <input
                type="text"
                value={estateForm.name}
                onChange={(e) => setEstateForm({ ...estateForm, name: e.target.value })}
                className="input-modern w-full"
                placeholder="Enter estate name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Total Units *
              </label>
              <input
                type="number"
                value={estateForm.total_units}
                onChange={(e) => setEstateForm({ ...estateForm, total_units: e.target.value })}
                className="input-modern w-full"
                placeholder="Number of units"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={estateForm.address}
              onChange={(e) => setEstateForm({ ...estateForm, address: e.target.value })}
              className="input-modern w-full"
              placeholder="Enter full address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={estateForm.city}
                onChange={(e) => setEstateForm({ ...estateForm, city: e.target.value })}
                className="input-modern w-full"
                placeholder="City"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={estateForm.state}
                onChange={(e) => setEstateForm({ ...estateForm, state: e.target.value })}
                className="input-modern w-full"
                placeholder="State"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={estateForm.country}
                onChange={(e) => setEstateForm({ ...estateForm, country: e.target.value })}
                className="input-modern w-full"
                placeholder="Country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={estateForm.contact_email}
                onChange={(e) => setEstateForm({ ...estateForm, contact_email: e.target.value })}
                className="input-modern w-full"
                placeholder="contact@estate.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={estateForm.contact_phone}
                onChange={(e) => setEstateForm({ ...estateForm, contact_phone: e.target.value })}
                className="input-modern w-full"
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="button-primary">
              Register Estate
            </Button>
            <Button 
              type="button" 
              onClick={() => setShowAddEstateModal(false)} 
              variant="outline" 
              className="button-secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Estate Details Modal */}
      <Modal
        isOpen={showEstateDetailsModal}
        onClose={() => setShowEstateDetailsModal(false)}
        title="Estate Details"
        size="lg"
      >
        {selectedEstate && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <BuildingIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-neutral-800">{selectedEstate.name}</h4>
                <p className="text-neutral-600">{selectedEstate.unique_id}</p>
              </div>
              <Badge className={`ml-auto ${
                selectedEstate.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                selectedEstate.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}>
                {selectedEstate.status?.toUpperCase()}
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-semibold text-neutral-800 border-b pb-2">Location Information</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-600">Address</p>
                      <p className="font-medium text-neutral-800">{selectedEstate.address}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">City, State</p>
                    <p className="font-medium text-neutral-800">{selectedEstate.city}, {selectedEstate.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Country</p>
                    <p className="font-medium text-neutral-800">{selectedEstate.country}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold text-neutral-800 border-b pb-2">Estate Statistics</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-600">Total Units</p>
                    <p className="font-medium text-neutral-800">{selectedEstate.total_units}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Occupied Units</p>
                    <p className="font-medium text-neutral-800">{selectedEstate.occupied_units || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Total Residents</p>
                    <p className="font-medium text-neutral-800">{selectedEstate.residents?.[0]?.count || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Total Guards</p>
                    <p className="font-medium text-neutral-800">{selectedEstate.guards?.[0]?.count || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h5 className="font-semibold text-neutral-800 border-b pb-2">Contact Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-neutral-600">Email</p>
                  <p className="font-medium text-neutral-800">{selectedEstate.contact_email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Phone</p>
                  <p className="font-medium text-neutral-800">{selectedEstate.contact_phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Registration Info */}
            <div className="space-y-4">
              <h5 className="font-semibold text-neutral-800 border-b pb-2">Registration Information</h5>
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-600">Registration Date</p>
                  <p className="font-medium text-neutral-800">
                    {new Date(selectedEstate.registration_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};