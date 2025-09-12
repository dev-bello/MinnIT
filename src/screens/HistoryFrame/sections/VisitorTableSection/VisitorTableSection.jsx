import React, { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../../contexts/AuthContext";
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
  XCircleIcon,
} from "lucide-react";

export const VisitorTableSection = ({ userRole }) => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [visitorData, setVisitorData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVisitorData = async () => {
    if (!userProfile) return;
    setLoading(true);
    let query = supabase.from("visitor_invites").select(`
      *,
      residents ( name, apartment_number )
    `);

    if (userRole === "resident") {
      query = query.eq("resident_id", userProfile.id);
    } else if (userRole === "admin") {
      query = query.eq("estate_id", userProfile.estate_id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching visitor data:", error);
    } else {
      setVisitorData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVisitorData();
  }, [userProfile, userRole]);

  const handleCancelInvite = async (inviteId) => {
    if (window.confirm("Are you sure you want to cancel this invitation?")) {
      try {
        await supabase
          .from("visitor_invites")
          .update({ status: "expired" })
          .eq("id", inviteId);
        fetchVisitorData();
      } catch (error) {
        console.error("Error canceling invite:", error);
        alert("Failed to cancel invite.");
      }
    }
  };

  // Apply filters
  const filteredVisitorData = visitorData.filter((visitor) => {
    const matchesSearch =
      visitor.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.residents?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      visitor.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesDate =
      !dateFilter ||
      new Date(visitor.created_at).toLocaleDateString().includes(dateFilter);

    const matchesPurpose = !purposeFilter || visitor.purpose === purposeFilter;

    return matchesSearch && matchesStatus && matchesDate && matchesPurpose;
  });
  const handleViewVisitor = (visitor) => {
    setSelectedVisitor(visitor);
    setIsViewModalOpen(true);
  };

  const getTableHeaders = () => {
    const baseHeaders = [
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
      { key: "name", label: "Visitor Name" },
    ];

    if (userRole === "admin") {
      return [
        ...baseHeaders,
        { key: "resident", label: "Resident" },
        { key: "purpose", label: "Purpose" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
      ];
    }

    if (userRole === "resident") {
      return [
        ...baseHeaders,
        { key: "purpose", label: "Purpose" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
      ];
    }

    if (userRole === "guard") {
      return [
        ...baseHeaders,
        { key: "resident", label: "Resident" },
        { key: "purpose", label: "Purpose" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
      ];
    }

    return [
      ...baseHeaders,
      { key: "status", label: "Status" },
      { key: "actions", label: "Actions" },
    ];
  };

  const headers = getTableHeaders();

  const renderCellContent = (visitor, headerKey) => {
    switch (headerKey) {
      case "date":
        return (
          <span className="text-sm text-neutral-600">
            {new Date(visitor.created_at).toLocaleDateString()}
          </span>
        );
      case "time":
        return (
          <span className="text-sm text-neutral-600">
            {new Date(visitor.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      case "name":
        return (
          <span className="text-sm font-medium text-neutral-800 truncate block">
            {visitor.visitor_name}
          </span>
        );
      case "resident":
        return (
          <span className="text-sm font-medium text-neutral-800">
            {visitor.residents?.name}
          </span>
        );
      case "purpose":
        return (
          <span className="text-sm font-medium text-neutral-800">
            {visitor.purpose}
          </span>
        );
      case "status":
        const status = visitor.status?.toLowerCase();
        let badgeClass = "bg-neutral-100 text-neutral-800 border-neutral-200";
        if (status === "approved" || status === "active") {
          badgeClass = "bg-green-100 text-green-800 border-green-200";
        } else if (status === "expired" || status === "used") {
          badgeClass = "bg-red-100 text-red-800 border-red-200";
        } else if (status === "pending") {
          badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
        }
        return <Badge className={badgeClass}>{visitor.status}</Badge>;
      case "actions":
        return (
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              onClick={() => handleViewVisitor(visitor)}
              className="button-table-action bg-blue-500 hover:bg-blue-600"
              title="View Details"
            >
              <EyeIcon className="w-4 h-4" />
            </Button>
            {userRole === "resident" && visitor.status === "approved" && (
              <Button
                size="sm"
                onClick={() => handleCancelInvite(visitor.id)}
                className="button-table-action bg-red-500 hover:bg-red-600"
                title="Cancel Invite"
              >
                <XCircleIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const statusOptions = ["Active", "Expired"];
  const purposeOptions = [...new Set(visitorData.map((v) => v.purpose))];

  const VisitorDetailView = ({ visitor }) => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-neutral-800">
            {visitor.visitor_name}
          </h4>
          <p className="text-neutral-600">{visitor.purpose}</p>
        </div>
        <Badge
          className={`ml-auto ${
            visitor.status?.toLowerCase() === "approved" ||
            visitor.status?.toLowerCase() === "active"
              ? "bg-green-100 text-green-800 border-green-200"
              : visitor.status?.toLowerCase() === "expired" ||
                visitor.status?.toLowerCase() === "used"
              ? "bg-red-100 text-red-800 border-red-200"
              : visitor.status?.toLowerCase() === "pending"
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : "bg-neutral-100 text-neutral-800 border-neutral-200"
          }`}
        >
          {visitor.status}
        </Badge>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h5 className="font-semibold text-neutral-800 border-b pb-2">
            Visitor Information
          </h5>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Name</p>
                <p className="font-medium text-neutral-800">
                  {visitor.visitor_name}
                </p>
              </div>
            </div>
            {visitor.visitor_phone && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-600">Phone</p>
                  <p className="font-medium text-neutral-800">
                    {visitor.visitor_phone}
                  </p>
                </div>
              </div>
            )}
            {visitor.visitor_email && (
              <div className="flex items-center gap-3">
                <MailIcon className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-600">Email</p>
                  <p className="font-medium text-neutral-800">
                    {visitor.visitor_email}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Purpose</p>
                <p className="font-medium text-neutral-800">
                  {visitor.purpose}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="font-semibold text-neutral-800 border-b pb-2">
            Visit Details
          </h5>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Resident</p>
                <p className="font-medium text-neutral-800">
                  {visitor.residents?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Apartment</p>
                <p className="font-medium text-neutral-800">
                  {visitor.residents?.apartment_number}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-600">Entry Time</p>
                <p className="font-medium text-neutral-800">
                  {new Date(visitor.created_at).toLocaleString()}
                </p>
              </div>
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
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
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
                  {purposeOptions.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
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
                    setSearchTerm("");
                    setStatusFilter("");
                    setDateFilter("");
                    setPurposeFilter("");
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
            Showing {filteredVisitorData.length} of {visitorData.length}{" "}
            visitors
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
                      <TableCell
                        key={header.key}
                        className="text-center whitespace-nowrap"
                      >
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
              <p className="text-base sm:text-lg font-medium">
                No visitors found
              </p>
              <p className="text-xs sm:text-sm">
                Try adjusting your search criteria
              </p>
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
