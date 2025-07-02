import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { EyeIcon, XCircleIcon, SearchIcon, FilterIcon, CalendarIcon } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const MyInvitesView = () => {
  const { db, userProfile } = useAuth();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      loadInvites();
    }
  }, [userProfile]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const data = await db.getVisitorInvites(userProfile.id);
      setInvites(data || []);
    } catch (error) {
      console.error('Error loading invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvite = async (id) => {
    if (confirm('Are you sure you want to cancel this invitation?')) {
      try {
        await db.updateVisitorInvite(id, { status: 'expired' });
        loadInvites();
      } catch (error) {
        console.error('Error canceling invite:', error);
        alert('Error canceling invitation. Please try again.');
      }
    }
  };

  const handleViewInvite = (invite) => {
    setSelectedInvite(invite);
    setIsViewModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'used': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter invites based on search term, status, and date
  const filteredInvites = invites.filter(invite => {
    const matchesSearch = invite.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.visitor_phone.includes(searchTerm) ||
                         invite.unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || invite.status === statusFilter;
    
    const matchesDate = !dateFilter || invite.visit_date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const statusOptions = ['pending', 'approved', 'used', 'expired'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-spin"></div>
            <div className="text-neutral-600 font-medium">Loading your invitations...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold font-display gradient-text">
          My Visitor Invitations
        </h2>
        <div className="text-xs sm:text-sm text-neutral-600 bg-neutral-100 px-3 py-2 rounded-xl">
          Total Invites: {invites.length}
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by visitor name, phone, code, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern w-full pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <FilterIcon className="text-neutral-400 w-4 h-4 hidden sm:block" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-modern min-w-[120px] sm:min-w-[150px]"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-neutral-400 w-4 h-4 hidden sm:block" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input-modern min-w-[120px] sm:min-w-[150px]"
                />
              </div>
              {(searchTerm || statusFilter || dateFilter) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setDateFilter('');
                  }}
                  variant="outline"
                  className="button-secondary mobile-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs sm:text-sm text-neutral-500">
            Showing {filteredInvites.length} of {invites.length} invitations
          </div>
        </CardContent>
      </Card>

      {/* Invites Table */}
      <Card className="table-modern">
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-800 font-display">
            Recent Invitations
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Invite ID</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Visitor</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm hidden md:table-cell">Time</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm hidden lg:table-cell">Purpose</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">OTP</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvites.map((invite) => (
                  <TableRow
                    key={invite.id}
                    className="table-row"
                  >
                    <TableCell className="text-center font-mono font-semibold text-primary-600 text-xs sm:text-sm">
                      {invite.unique_id}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-800 text-xs sm:text-sm truncate">
                          {invite.visitor_name}
                        </div>
                        <div className="sm:hidden text-xs text-neutral-500 truncate">
                          {invite.visitor_phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs sm:text-sm text-neutral-600 hidden sm:table-cell">
                      {invite.visitor_phone}
                    </TableCell>
                    <TableCell className="text-center text-xs text-neutral-600">
                      {new Date(invite.visit_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center text-xs text-neutral-600 hidden md:table-cell">
                      {invite.visit_time}
                    </TableCell>
                    <TableCell className="text-center text-xs sm:text-sm text-neutral-600 hidden lg:table-cell">
                      {invite.purpose}
                    </TableCell>
                    <TableCell className="text-center">
                      <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono font-bold">
                        {invite.otp_code}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${getStatusColor(invite.status)} border-none text-xs font-semibold`}>
                        {invite.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="button-group-table">
                        <Button 
                          size="sm" 
                          onClick={() => handleViewInvite(invite)}
                          className="button-table-action bg-blue-500 hover:bg-blue-600 text-white border-none"
                        >
                          <EyeIcon className="w-3 h-3" />
                        </Button>
                        {invite.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleCancelInvite(invite.id)}
                            className="button-table-action bg-red-500 hover:bg-red-600 text-white border-none"
                          >
                            <XCircleIcon className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredInvites.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-neutral-500">
              <CalendarIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-base sm:text-lg font-medium">No invitations found</p>
              <p className="text-xs sm:text-sm">Try adjusting your search criteria or create a new invitation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Invitation Details"
        size="lg"
      >
        {selectedInvite && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <EyeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-neutral-800">{selectedInvite.visitor_name}</h4>
                <p className="text-neutral-600">{selectedInvite.purpose}</p>
              </div>
              <Badge className={`ml-auto ${getStatusColor(selectedInvite.status)}`}>
                {selectedInvite.status.toUpperCase()}
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-semibold text-neutral-800 border-b pb-2">Visitor Information</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-600">Visitor Name</p>
                    <p className="font-medium text-neutral-800">{selectedInvite.visitor_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Phone Number</p>
                    <p className="font-medium text-neutral-800">{selectedInvite.visitor_phone}</p>
                  </div>
                  {selectedInvite.visitor_email && (
                    <div>
                      <p className="text-sm text-neutral-600">Email</p>
                      <p className="font-medium text-neutral-800">{selectedInvite.visitor_email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-neutral-600">Purpose of Visit</p>
                    <p className="font-medium text-neutral-800">{selectedInvite.purpose}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold text-neutral-800 border-b pb-2">Visit Details</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-600">Visit Date</p>
                    <p className="font-medium text-neutral-800">{selectedInvite.visit_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Visit Time</p>
                    <p className="font-medium text-neutral-800">{selectedInvite.visit_time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">OTP Code</p>
                    <p className="font-medium text-neutral-800 font-mono text-lg">{selectedInvite.otp_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Invitation ID</p>
                    <p className="font-medium text-neutral-800 font-mono">{selectedInvite.unique_id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h5 className="font-semibold text-neutral-800 border-b pb-2">Additional Information</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Status</p>
                  <Badge className={getStatusColor(selectedInvite.status)}>
                    {selectedInvite.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Created</p>
                  <p className="font-medium text-neutral-800">
                    {new Date(selectedInvite.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Expires</p>
                  <p className="font-medium text-neutral-800">
                    {new Date(selectedInvite.expires_at).toLocaleString()}
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