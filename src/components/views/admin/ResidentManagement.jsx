import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, FilterIcon, HomeIcon, UserIcon, BuildingIcon, CheckCircleIcon, ClockIcon, XCircleIcon, EyeIcon, LockIcon } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const ResidentManagement = () => {
  const { db, currentEstate } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [apartmentFilter, setApartmentFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    apartmentNumber: ''
  });
  const [selectedResident, setSelectedResident] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Fetch residents from database
  useEffect(() => {
    const fetchResidents = async () => {
      if (!db || !currentEstate?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await db
          .from('residents')
          .select('*')
          .eq('estate_id', currentEstate.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching residents:', error);
        } else {
          setResidents(data || []);
        }
      } catch (error) {
        console.error('Error fetching residents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, [db, currentEstate]);

  const generateUniqueId = () => {
    const lastId = residents.length > 0 ? 
      Math.max(...residents.map(r => parseInt(r.unique_id.replace('RES', '')))) : 0;
    return `RES${String(lastId + 1).padStart(3, '0')}`;
  };

  const handleAddResident = async (e) => {
    e.preventDefault();
    if (!db || !currentEstate?.id) return;

    try {
      const { data, error } = await db
        .from('residents')
        .insert([{
          estate_id: currentEstate.id,
          name: formData.name,
          email: formData.email,
          apartment_number: formData.apartmentNumber,
          status: 'active',
          can_edit: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding resident:', error);
      } else {
        setResidents([data, ...residents]);
        setFormData({ name: '', email: '', apartmentNumber: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding resident:', error);
    }
  };

  const handleDeleteResident = async (id) => {
    if (!db) return;

    try {
      const { error } = await db
        .from('residents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting resident:', error);
      } else {
        setResidents(residents.filter(resident => resident.id !== id));
      }
    } catch (error) {
      console.error('Error deleting resident:', error);
    }
  };

  const handleViewResident = (resident) => {
    setSelectedResident(resident);
    setIsViewModalOpen(true);
  };

  const handleEditResident = (resident) => {
    if (!resident.can_edit) {
      setSelectedResident(resident);
      setShowPermissionModal(true);
      return;
    }
    setSelectedResident(resident);
    setIsEditModalOpen(true);
  };

  const handleSaveResident = async (updatedResident) => {
    if (!db) return;

    try {
      const { error } = await db
        .from('residents')
        .update({
          name: updatedResident.name,
          email: updatedResident.email,
          apartment_number: updatedResident.apartmentNumber
        })
        .eq('id', updatedResident.id);

      if (error) {
        console.error('Error updating resident:', error);
      } else {
        setResidents(residents.map(resident => 
          resident.id === updatedResident.id ? { ...resident, ...updatedResident } : resident
        ));
        setIsEditModalOpen(false);
        setSelectedResident(null);
      }
    } catch (error) {
      console.error('Error updating resident:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'moved_out': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'inactive': return <XCircleIcon className="w-4 h-4" />;
      case 'moved_out': return <ClockIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  // Filter residents based on search term, status, and apartment filter
  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.apartment_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || resident.status === statusFilter;
    
    const matchesApartment = !apartmentFilter || 
                            resident.apartment_number.toLowerCase().includes(apartmentFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesApartment;
  });

  // Get unique apartment blocks for filtering
  const apartmentBlocks = [...new Set(residents.map(r => r.apartment_number.charAt(0)))].sort();
  const statusOptions = ['active', 'inactive', 'moved_out'];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-effect rounded-2xl p-6 shadow-soft border-0">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading residents...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6 shadow-soft border-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-soft">
              <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-800">
                Resident Management
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">Manage residents and their access to the system</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="button-primary mobile-full"
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add Resident
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-neutral-600">Total Residents</p>
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
      </div>

      {/* Search and Filter Section */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search residents by name, email, ID, or apartment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern w-full pl-10 sm:pl-12"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <FilterIcon className="text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-modern flex-1 sm:min-w-[150px]"
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
                  className="input-modern flex-1 sm:min-w-[150px]"
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
                  className="button-secondary mobile-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 text-xs sm:text-sm text-neutral-500">
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="text-center font-semibold whitespace-nowrap">ID</TableHead>
                  <TableHead className="text-center font-semibold whitespace-nowrap">Name</TableHead>
                  <TableHead className="text-center font-semibold whitespace-nowrap">Email</TableHead>
                  <TableHead className="text-center font-semibold whitespace-nowrap">Apartment</TableHead>
                  <TableHead className="text-center font-semibold whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-center font-semibold whitespace-nowrap">Registered</TableHead>
                  <TableHead className="text-center font-semibold whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.map((resident, index) => (
                  <TableRow key={resident.id} className="table-row">
                    <TableCell className="text-center font-mono font-semibold text-primary-600 whitespace-nowrap">
                      {resident.unique_id}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-neutral-800 whitespace-nowrap">
                      {resident.name}
                    </TableCell>
                    <TableCell className="text-center text-neutral-600 whitespace-nowrap">
                      {resident.email}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {resident.apartment_number}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(resident.status)}
                        <Badge className={getStatusColor(resident.status)}>
                          {(resident.status || 'active').replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-neutral-500 whitespace-nowrap">
                      {new Date(resident.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleViewResident(resident)}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-1 sm:px-3 sm:py-2"
                        >
                          <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleEditResident(resident)}
                          className={`rounded-lg p-1 sm:px-3 sm:py-2 ${
                            resident.can_edit 
                              ? 'bg-green-500 hover:bg-green-600 text-white' 
                              : 'bg-gray-400 hover:bg-gray-500 text-white'
                          }`}
                          title={resident.can_edit ? 'Edit Resident' : 'Edit Permission Required'}
                        >
                          {resident.can_edit ? <EditIcon className="w-3 h-3 sm:w-4 sm:h-4" /> : <LockIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteResident(resident.id)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-1 sm:px-3 sm:py-2"
                        >
                          <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredResidents.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-neutral-500">
              <HomeIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-neutral-300" />
              <p className="text-base sm:text-lg font-medium">No residents found</p>
              <p className="text-xs sm:text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Resident Details"
        size="lg"
      >
        {selectedResident && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-neutral-800">{selectedResident.name}</h4>
                <p className="text-neutral-600">{selectedResident.email}</p>
              </div>
              <Badge className={`ml-auto ${getStatusColor(selectedResident.status)}`}>
                {selectedResident.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-semibold text-neutral-800 border-b pb-2">Personal Information</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-600">Full Name</p>
                    <p className="font-medium text-neutral-800">{selectedResident.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Email Address</p>
                    <p className="font-medium text-neutral-800">{selectedResident.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Resident ID</p>
                    <p className="font-medium text-neutral-800 font-mono">{selectedResident.unique_id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold text-neutral-800 border-b pb-2">Property Information</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-600">Apartment Number</p>
                    <p className="font-medium text-neutral-800">{selectedResident.apartment_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Registration Date</p>
                    <p className="font-medium text-neutral-800">
                      {new Date(selectedResident.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedResident.status)}
                      <Badge className={getStatusColor(selectedResident.status)}>
                        {selectedResident.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Edit Permission</p>
                    <Badge className={selectedResident.can_edit ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {selectedResident.can_edit ? 'ALLOWED' : 'RESTRICTED'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Resident Information"
        size="lg"
      >
        {selectedResident && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedResident = {
              ...selectedResident,
              name: formData.get('name'),
              email: formData.get('email'),
              apartmentNumber: formData.get('apartmentNumber')
            };
            handleSaveResident(updatedResident);
          }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedResident.name}
                  className="input-modern w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={selectedResident.email}
                  className="input-modern w-full"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Apartment Number
              </label>
              <input
                type="text"
                name="apartmentNumber"
                defaultValue={selectedResident.apartment_number}
                className="input-modern w-full"
                placeholder="e.g., A-101, B-205"
                required
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="button-primary">
                Save Changes
              </Button>
              <Button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)} 
                variant="outline" 
                className="button-secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Permission Modal */}
      <Modal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        title="Edit Permission Required"
        size="md"
      >
        {selectedResident && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <LockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-neutral-800">Permission Required</h4>
                <p className="text-neutral-600">This resident requires edit permission</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-neutral-700">
                You cannot edit <strong>{selectedResident.name}</strong>'s information because they have not granted edit permission.
              </p>
              <p className="text-sm text-neutral-600">
                Contact the resident to request edit permission, or use the view option to see their current information.
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => {
                  setShowPermissionModal(false);
                  setIsViewModalOpen(true);
                }}
                className="button-primary"
              >
                View Details Instead
              </Button>
              <Button 
                onClick={() => setShowPermissionModal(false)} 
                variant="outline" 
                className="button-secondary"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};