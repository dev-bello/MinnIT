import React, { useState } from "react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Modal } from "../../../../components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { 
  SearchIcon, 
  FilterIcon, 
  CalendarIcon, 
  UsersIcon, 
  EyeIcon, 
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from "lucide-react";

export const VisitorTableSection = ({ userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);


  // Data for visitor records - filtered based on user role
  const allVisitorData = [
    {
      id: 1,
      date: "10-01-23",
      time: "10:30:28",
      name: "Bello Yahaya",
      contactInfo: "12345@gmail.com",
      verifiedBy: "guard 14",
      status: "Active",
      resident: "John Doe",
      purpose: "Business Meeting",
      apartment: "A-101",
      phone: "09012345678",
      email: "bello@email.com",
      entryTime: "10:30:28",
      notes: "Business meeting with resident"
    },
    {
      id: 2,
      date: "17-01-25",
      time: "8:00:23",
      name: "Sarah Johnson",
      contactInfo: "0908641283747",
      verifiedBy: "guard 28",
      status: "expired",
      resident: "Jane Smith",
      purpose: "Personal Visit",
      apartment: "B-205",
      phone: "0908641283747",
      email: "sarah@email.com",
      entryTime: "8:00:23",
      notes: "Personal visit to friend"
    },
    {
      id: 3,
      date: "02-02-25",
      time: "21:00:03",
      name: "Mike Wilson",
      contactInfo: "070462416738",
      verifiedBy: "guard 8",
      status: "Active",
      resident: "John Doe",
      purpose: "Delivery",
      apartment: "A-101",
      phone: "070462416738",
      email: "mike@delivery.com",
      entryTime: "21:00:03",
      notes: "Food delivery service"
    },
    {
      id: 4,
      date: "03-02-25",
      time: "00:00:01",
      name: "Lisa Brown",
      contactInfo: "1wufh@gmail.com",
      verifiedBy: "Guard 2",
      status: "Active",
      resident: "Bob Johnson",
      purpose: "Family Visit",
      apartment: "C-301",
      phone: "08012345678",
      email: "lisa@email.com",
      entryTime: "00:00:01",
      notes: "Late night family visit"
    },
    {
      id: 5,
      date: "04-02-25",
      time: "14:15:30",
      name: "David Chen",
      contactInfo: "david@email.com",
      verifiedBy: "guard 5",
      status: "expired",
      resident: "Alice Wong",
      purpose: "Maintenance",
      apartment: "D-405",
      phone: "07098765432",
      email: "david@email.com",
      entryTime: "14:15:30",
      notes: "Plumbing maintenance work"
    },
    {
      id: 6,
      date: "05-02-25",
      time: "09:45:12",
      name: "Emma Davis",
      contactInfo: "0701234567",
      verifiedBy: "guard 12",
      status: "Active",
      resident: "John Doe",
      purpose: "Social Visit",
      apartment: "A-101",
      phone: "0701234567",
      email: "emma@email.com",
      entryTime: "09:45:12",
      notes: "Social visit with resident"
    }
  ];

  // Filter data based on user role
  const getVisitorData = () => {
    if (userRole === 'resident') {
      // Residents only see their own visitors
      return allVisitorData.filter(visitor => visitor.resident === "John Doe");
    }
    return allVisitorData;
  };

  const visitorData = getVisitorData();

  // Apply filters
  const filteredVisitorData = visitorData.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.contactInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.verifiedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || visitor.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesDate = !dateFilter || visitor.date.includes(dateFilter);
    
    const matchesPurpose = !purposeFilter || visitor.purpose === purposeFilter;
    
    return matchesSearch && matchesStatus && matchesDate && matchesPurpose;
  });

  const handleViewVisitor = (visitor) => {
    setSelectedVisitor(visitor);
    setIsViewModalOpen(true);
  };



  const getTableHeaders = () => {
    const baseHeaders = [
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'name', label: 'Name' },
      { key: 'contactInfo', label: 'Contact' },
    ];

    if (userRole === 'admin') {
      return [
        ...baseHeaders,
        { key: 'resident', label: 'Resident' },
        { key: 'purpose', label: 'Purpose' },
        { key: 'verifiedBy', label: 'Verified By' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Actions' }
      ];
    }

    if (userRole === 'guard') {
      return [
        ...baseHeaders,
        { key: 'resident', label: 'Resident' },
        { key: 'purpose', label: 'Purpose' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Actions' }
      ];
    }

    if (userRole === 'resident') {
      return [
        ...baseHeaders,
        { key: 'purpose', label: 'Purpose' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Actions' }
      ];
    }

    return [...baseHeaders, { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' }];
  };

  const headers = getTableHeaders();

  const renderCellContent = (visitor, headerKey) => {
    switch (headerKey) {
      case 'date':
        return (
          <span className="text-sm text-neutral-600">
            {visitor.date}
          </span>
        );
      case 'time':
        return (
          <span className="text-sm text-neutral-600">
            {visitor.time}
          </span>
        );
      case 'name':
      case 'contactInfo':
      case 'resident':
      case 'purpose':
        return (
          <span className="text-sm font-medium text-neutral-800 truncate block">
            {visitor[headerKey]}
          </span>
        );
      case 'verifiedBy':
        return (
          <span className="text-sm font-medium text-neutral-800">
            {visitor.verifiedBy}
          </span>
        );
      case 'status':
        return (
          <Badge
            className={
              visitor.status.toLowerCase() === "active"
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
            }
          >
            {visitor.status}
          </Badge>
        );
      case 'actions':
        return (
          <div className="flex justify-center">
            <Button
              size="sm"
              onClick={() => handleViewVisitor(visitor)}
              className="button-table-action bg-blue-500 hover:bg-blue-600"
              title="View Details"
            >
              <EyeIcon className="w-4 h-4" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const statusOptions = ['Active', 'Expired'];
  const purposeOptions = [...new Set(visitorData.map(v => v.purpose))];

  const VisitorDetailView = ({ visitor }) => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-neutral-800">{visitor.name}</h4>
          <p className="text-neutral-600">{visitor.purpose}</p>
        </div>
        <Badge
          className={`ml-auto ${
            visitor.status.toLowerCase() === "active"
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200"
          }`}
        >
          {visitor.status}
        </Badge>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h5 className="font-semibold text-neutral-800 border-b pb-2">Visitor Information</h5>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Name</p>
                <p className="font-medium text-neutral-800">{visitor.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Phone</p>
                <p className="font-medium text-neutral-800">{visitor.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MailIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Email</p>
                <p className="font-medium text-neutral-800">{visitor.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Purpose</p>
                <p className="font-medium text-neutral-800">{visitor.purpose}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="font-semibold text-neutral-800 border-b pb-2">Visit Details</h5>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Resident</p>
                <p className="font-medium text-neutral-800">{visitor.resident}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Apartment</p>
                <p className="font-medium text-neutral-800">{visitor.apartment}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Entry Time</p>
                <p className="font-medium text-neutral-800">{visitor.entryTime}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h5 className="font-semibold text-neutral-800 border-b pb-2">Additional Information</h5>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-neutral-400" />
            <div>
              <p className="text-sm text-neutral-600">Verified By</p>
              <p className="font-medium text-neutral-800">{visitor.verifiedBy}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-neutral-400 mt-1">
              <CheckCircleIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Notes</p>
              <p className="font-medium text-neutral-800">{visitor.notes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );



  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Filter Section */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search visitors by name, contact, resident, or guard..."
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
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value)}
                  className="input-modern flex-1 sm:min-w-[150px]"
                >
                  <option value="">All Purposes</option>
                  {purposeOptions.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="DD-MM-YY"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input-modern w-full sm:w-24"
                />
              </div>
              {(searchTerm || statusFilter || dateFilter || purposeFilter) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setDateFilter('');
                    setPurposeFilter('');
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
            Showing {filteredVisitorData.length} of {visitorData.length} visitors
          </div>
        </CardContent>
      </Card>

      {/* Visitors Table */}
      <Card className="table-modern">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  {headers.map((header) => (
                    <TableHead 
                      key={header.key}
                      className="text-center font-semibold text-neutral-800 whitespace-nowrap"
                    >
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitorData.map((visitor, index) => (
                  <TableRow key={visitor.id} className="table-row">
                    {headers.map((header) => (
                      <TableCell key={header.key} className="text-center whitespace-nowrap">
                        {renderCellContent(visitor, header.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredVisitorData.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-neutral-500">
              <UsersIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-neutral-300" />
              <p className="text-base sm:text-lg font-medium">No visitors found</p>
              <p className="text-xs sm:text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Visitor Details"
        size="lg"
      >
        {selectedVisitor && <VisitorDetailView visitor={selectedVisitor} />}
      </Modal>


    </div>
  );
};