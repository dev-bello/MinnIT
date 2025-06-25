import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { EyeIcon, XCircleIcon, SearchIcon, FilterIcon, CalendarIcon } from 'lucide-react';
import { mockVisitorInvites } from '../../../contexts/AuthContext';

export const MyInvitesView = () => {
  const [invites, setInvites] = useState(mockVisitorInvites);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const handleCancelInvite = (id) => {
    setInvites(invites.map(invite => 
      invite.id === id ? { ...invite, status: 'expired' } : invite
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter invites based on search term, status, and date
  const filteredInvites = invites.filter(invite => {
    const matchesSearch = invite.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.visitorPhone.includes(searchTerm) ||
                         invite.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invite.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || invite.status === statusFilter;
    
    const matchesDate = !dateFilter || invite.visitDate === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const statusOptions = ['pending', 'approved', 'expired'];

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                {invites.filter(i => i.status === 'approved').length}
              </div>
              <div className="text-xs sm:text-sm text-neutral-600 font-medium">Approved</div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-1">
                {invites.filter(i => i.status === 'pending').length}
              </div>
              <div className="text-xs sm:text-sm text-neutral-600 font-medium">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">
                {invites.filter(i => i.status === 'expired').length}
              </div>
              <div className="text-xs sm:text-sm text-neutral-600 font-medium">Expired</div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                {invites.filter(i => new Date(i.visitDate) >= new Date()).length}
              </div>
              <div className="text-xs sm:text-sm text-neutral-600 font-medium">Upcoming</div>
            </div>
          </CardContent>
        </Card>
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
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Visitor</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm hidden md:table-cell">Time</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm hidden lg:table-cell">Purpose</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Code</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-center font-semibold text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvites.map((invite, index) => (
                  <TableRow
                    key={invite.id}
                    className="table-row"
                  >
                    <TableCell className="text-center">
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-800 text-xs sm:text-sm truncate">
                          {invite.visitorName}
                        </div>
                        <div className="sm:hidden text-xs text-neutral-500 truncate">
                          {invite.visitorPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs sm:text-sm text-neutral-600 hidden sm:table-cell">
                      {invite.visitorPhone}
                    </TableCell>
                    <TableCell className="text-center text-xs text-neutral-600">
                      {new Date(invite.visitDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center text-xs text-neutral-600 hidden md:table-cell">
                      {invite.visitTime}
                    </TableCell>
                    <TableCell className="text-center text-xs sm:text-sm text-neutral-600 hidden lg:table-cell">
                      {invite.purpose}
                    </TableCell>
                    <TableCell className="text-center">
                      <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                        {invite.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${getStatusColor(invite.status)} border-none text-xs font-semibold`}>
                        {invite.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="button-group-table">
                        <Button size="sm" variant="outline" className="button-table-action bg-blue-500 hover:bg-blue-600 text-white border-none">
                          <EyeIcon className="w-3 h-3" />
                        </Button>
                        {invite.status !== 'expired' && (
                          <Button
                            size="sm"
                            variant="outline"
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
              <p className="text-xs sm:text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};