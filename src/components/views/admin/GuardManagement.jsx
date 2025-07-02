import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, FilterIcon, ShieldIcon, UserIcon, ClockIcon, EyeIcon } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const GuardManagement = () => {
  const { db, currentEstate } = useAuth();
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shiftSchedule: '',
  });
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch guards from database
  useEffect(() => {
    const fetchGuards = async () => {
      if (!db || !currentEstate?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await db
          .from('guards')
          .select('*')
          .eq('estate_id', currentEstate.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching guards:', error);
        } else {
          setGuards(data || []);
        }
      } catch (error) {
        console.error('Error fetching guards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuards();
  }, [db, currentEstate]);

  const generateUniqueId = () => {
    const lastId = guards.length > 0 ? 
      Math.max(...guards.map(g => parseInt(g.unique_id.replace('GRD', '')))) : 0;
    return `GRD${String(lastId + 1).padStart(3, '0')}`;
  };

  const handleAddGuard = async (e) => {
    e.preventDefault();
    if (!db || !currentEstate?.id) return;

    try {
      const { data, error } = await db
        .from('guards')
        .insert([{
          estate_id: currentEstate.id,
          name: formData.name,
          email: formData.email,
          shift_schedule: formData.shiftSchedule,
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding guard:', error);
      } else {
        setGuards([data, ...guards]);
        setFormData({ name: '', email: '', shiftSchedule: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding guard:', error);
    }
  };

  const handleDeleteGuard = async (id) => {
    if (!db) return;

    try {
      const { error } = await db
        .from('guards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting guard:', error);
      } else {
        setGuards(guards.filter(guard => guard.id !== id));
      }
    } catch (error) {
      console.error('Error deleting guard:', error);
    }
  };

  const handleViewGuard = (guard) => {
    setSelectedGuard(guard);
    setIsViewModalOpen(true);
  };

  const handleEditGuard = (guard) => {
    setSelectedGuard(guard);
    setIsEditModalOpen(true);
  };

  const handleSaveGuard = async (updatedGuard) => {
    if (!db) return;

    try {
      const { error } = await db
        .from('guards')
        .update({
          name: updatedGuard.name,
          email: updatedGuard.email,
          shift_schedule: updatedGuard.shiftSchedule
        })
        .eq('id', updatedGuard.id);

      if (error) {
        console.error('Error updating guard:', error);
      } else {
        setGuards(guards.map(guard => 
          guard.id === updatedGuard.id ? { ...guard, ...updatedGuard } : guard
        ));
        setIsEditModalOpen(false);
        setSelectedGuard(null);
      }
    } catch (error) {
      console.error('Error updating guard:', error);
    }
  };

  // Filter guards based on search term and shift filter
  const filteredGuards = guards.filter(guard => {
    const matchesSearch = guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guard.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guard.unique_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesShift = !shiftFilter || guard.shift_schedule === shiftFilter;
    
    return matchesSearch && matchesShift;
  });

  const shiftOptions = [
    'Morning (6AM - 2PM)',
    'Evening (2PM - 10PM)',
    'Night (10PM - 6AM)'
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-effect rounded-2xl p-6 shadow-soft border-0">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading guards...</p>
            </div>
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-soft">
              <ShieldIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-800">
                Guard Management
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">Manage security personnel and their schedules</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="button-primary mobile-full"
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add Guard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-600">Total Guards</p>
                <p className="text-xl sm:text-2xl font-bold text-neutral-800">{guards.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-600">On Duty</p>
                <p className="text-xl sm:text-2xl font-bold text-neutral-800">
                  {guards.filter(g => g.status === 'active').length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search guards by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern w-full pl-10 sm:pl-12"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <FilterIcon className="text-neutral-400 w-4 h-4 sm:w-5 sm:h-5 hidden sm:block" />
                <select
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  className="input-modern min-w-[150px] sm:min-w-[200px]"
                >
                  <option value="">All Shifts</option>
                  {shiftOptions.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>
              {(searchTerm || shiftFilter) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setShiftFilter('');
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
            Showing {filteredGuards.length} of {guards.length} guards
          </div>
        </CardContent>
      </Card>

      {/* Add Form */}
      {showAddForm && (
        <Card className="glass-effect rounded-2xl shadow-soft border-0 animate-slide-down">
          <CardHeader>
            <h3 className="text-lg sm:text-xl font-bold font-display text-neutral-800">Add New Guard</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddGuard} className="space-y-6">
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
                  Shift Schedule
                </label>
                <select
                  value={formData.shiftSchedule}
                  onChange={(e) => setFormData({ ...formData, shiftSchedule: e.target.value })}
                  className="input-modern w-full"
                  required
                >
                  <option value="">Select Shift</option>
                  {shiftOptions.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>
              <div className="button-group">
                <Button type="submit" className="button-primary mobile-full">
                  Add Guard
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="button-secondary mobile-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Guards Table */}
      <Card className="table-modern">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">ID</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Name</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Shift</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuards.map((guard, index) => (
                  <TableRow key={guard.id} className="table-row">
                    <TableCell className="text-center font-mono font-semibold text-primary-600 text-xs sm:text-sm">
                      {guard.unique_id}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-neutral-800 text-xs sm:text-sm">
                      <div className="min-w-0">
                        <div className="truncate">{guard.name}</div>
                        <div className="sm:hidden text-xs text-neutral-500 truncate">{guard.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-neutral-600 text-xs sm:text-sm hidden sm:table-cell">
                      {guard.email}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                        {guard.shift_schedule}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs text-neutral-500 hidden md:table-cell">
                      {new Date(guard.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="button-group-table">
                        <Button 
                          size="sm" 
                          onClick={() => handleViewGuard(guard)}
                          className="button-table-action bg-blue-500 hover:bg-blue-600"
                        >
                          <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleEditGuard(guard)}
                          className="button-table-action bg-green-500 hover:bg-green-600"
                        >
                          <EditIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteGuard(guard.id)}
                          className="button-table-action bg-red-500 hover:bg-red-600"
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
          {filteredGuards.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-neutral-500">
              <ShieldIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-base sm:text-lg font-medium">No guards found</p>
              <p className="text-xs sm:text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Guard Details"
        size="lg"
      >
        {selectedGuard && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <ShieldIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-neutral-800">{selectedGuard.name}</h4>
                <p className="text-neutral-600">{selectedGuard.email}</p>
              </div>
              <Badge className="ml-auto bg-blue-100 text-blue-800 border-blue-200">
                {selectedGuard.shift_schedule}
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-semibold text-neutral-800 border-b pb-2">Personal Information</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-600">Full Name</p>
                    <p className="font-medium text-neutral-800">{selectedGuard.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Email Address</p>
                    <p className="font-medium text-neutral-800">{selectedGuard.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Guard ID</p>
                    <p className="font-medium text-neutral-800 font-mono">{selectedGuard.unique_id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold text-neutral-800 border-b pb-2">Work Information</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-600">Shift Schedule</p>
                    <p className="font-medium text-neutral-800">{selectedGuard.shift_schedule}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Registration Date</p>
                    <p className="font-medium text-neutral-800">
                      {new Date(selectedGuard.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Status</p>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {selectedGuard.status?.toUpperCase() || 'ACTIVE'}
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
        title="Edit Guard Information"
        size="lg"
      >
        {selectedGuard && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedGuard = {
              ...selectedGuard,
              name: formData.get('name'),
              email: formData.get('email'),
              shiftSchedule: formData.get('shiftSchedule')
            };
            handleSaveGuard(updatedGuard);
          }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedGuard.name}
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
                  defaultValue={selectedGuard.email}
                  className="input-modern w-full"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Shift Schedule
              </label>
              <select
                name="shiftSchedule"
                defaultValue={selectedGuard.shift_schedule}
                className="input-modern w-full"
                required
              >
                <option value="">Select Shift</option>
                {shiftOptions.map(shift => (
                  <option key={shift} value={shift}>{shift}</option>
                ))}
              </select>
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
    </div>
  );
};