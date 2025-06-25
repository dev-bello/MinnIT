import React, { useState } from "react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { SearchIcon, FilterIcon, CalendarIcon } from "lucide-react";

export const VisitorTableSection = ({ userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');

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
      purpose: "Business Meeting"
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
      purpose: "Personal Visit"
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
      purpose: "Delivery"
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
      purpose: "Family Visit"
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
      purpose: "Maintenance"
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
      purpose: "Social Visit"
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
          <span className="font-['Stick',Helvetica] font-normal text-[#393e46] text-[10px] lg:text-[11px]">
            {visitor.date}
          </span>
        );
      case 'time':
        return (
          <span className="font-['Stick',Helvetica] font-normal text-[#393e46] text-[10px] lg:text-[11px]">
            {visitor.time}
          </span>
        );
      case 'name':
      case 'contactInfo':
      case 'resident':
      case 'purpose':
        return (
          <span className="font-['Koulen',Helvetica] font-normal text-[#000000] text-[11px] lg:text-[13px] truncate block">
            {visitor[headerKey]}
          </span>
        );
      case 'verifiedBy':
        return (
          <span className="font-['Koulen',Helvetica] font-normal text-[#000000] text-[11px] lg:text-[13px]">
            {visitor.verifiedBy}
          </span>
        );
      case 'status':
        return (
          <Badge
            className={`font-['Koulen',Helvetica] font-normal text-xs lg:text-base border-none ${
              visitor.status.toLowerCase() === "active"
                ? "bg-transparent text-[#18600e]"
                : "bg-transparent text-[#a90a0a]"
            }`}
          >
            {visitor.status}
          </Badge>
        );
      case 'actions':
        return (
          <Button
            variant="outline"
            className="rounded-md bg-white hover:bg-gray-100 text-xs px-2 py-1 lg:px-3 lg:py-1"
          >
            VIEW
          </Button>
        );
      default:
        return null;
    }
  };

  const statusOptions = ['Active', 'Expired'];
  const purposeOptions = [...new Set(visitorData.map(v => v.purpose))];

  return (
    <div className="w-full py-4 space-y-4">
      {/* Search and Filter Section */}
      <Card className="bg-[#393e46] border-[#948979]">
        <CardContent className="p-3 lg:p-4">
          <div className="flex flex-col gap-3 lg:gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#948979] w-4 h-4" />
              <input
                type="text"
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#e0d0d0] border border-[#948979] rounded-md text-[#393e46] focus:outline-none focus:ring-2 focus:ring-[#948979] text-sm"
              />
            </div>
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FilterIcon className="text-[#948979] w-4 h-4 hidden lg:block" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 lg:flex-none px-2 lg:px-3 py-2 bg-[#e0d0d0] border border-[#948979] rounded-md text-[#393e46] focus:outline-none focus:ring-2 focus:ring-[#948979] text-sm"
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
                  className="flex-1 lg:flex-none px-2 lg:px-3 py-2 bg-[#e0d0d0] border border-[#948979] rounded-md text-[#393e46] focus:outline-none focus:ring-2 focus:ring-[#948979] text-sm"
                >
                  <option value="">All Purposes</option>
                  {purposeOptions.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 col-span-2 lg:col-span-1">
                <CalendarIcon className="text-[#948979] w-4 h-4 hidden lg:block" />
                <input
                  type="text"
                  placeholder="DD-MM-YY"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="flex-1 lg:w-24 px-2 lg:px-3 py-2 bg-[#e0d0d0] border border-[#948979] rounded-md text-[#393e46] focus:outline-none focus:ring-2 focus:ring-[#948979] text-sm"
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
                  className="border-[#948979] text-[#e8eaed] hover:bg-[#948979] text-xs px-2 py-1 col-span-2 lg:col-span-1"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="mt-2 text-sm text-[#948979]">
            Showing {filteredVisitorData.length} of {visitorData.length} visitors
          </div>
        </CardContent>
      </Card>

      <Card className="w-full shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#948979] rounded">
                <TableRow>
                  {headers.map((header) => (
                    <TableHead 
                      key={header.key}
                      className="text-center font-['Koulen',Helvetica] text-[#1e1e1e] text-sm lg:text-base whitespace-nowrap px-2 lg:px-4"
                    >
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitorData.map((visitor, index) => (
                  <TableRow
                    key={visitor.id}
                    className={
                      index % 2 === 0
                        ? "bg-[#e8e3e39e]"
                        : "bg-[#e8e3e39e] shadow-[0px_4px_20px_#6e4a4a70]"
                    }
                  >
                    {headers.map((header) => (
                      <TableCell key={header.key} className="text-center px-2 lg:px-4 py-2 lg:py-3">
                        {renderCellContent(visitor, header.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredVisitorData.length === 0 && (
            <div className="text-center py-8 text-[#948979]">
              No visitors found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};