import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  AlertTriangleIcon, 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  PhoneIcon,
  MapPinIcon
} from 'lucide-react';

export const SecurityReportsView = () => {
  const [reports, setReports] = useState([
    {
      id: '1',
      title: 'Suspicious Activity in Parking Lot',
      description: 'Unknown person loitering around cars in Block A parking area',
      priority: 'high',
      status: 'pending',
      location: 'Block A - Parking Lot',
      reportedAt: '2024-01-15T14:30:00Z',
      category: 'suspicious_activity'
    },
    {
      id: '2',
      title: 'Broken Security Light',
      description: 'Security light near entrance gate is not working, creating dark spot',
      priority: 'medium',
      status: 'in_progress',
      location: 'Main Entrance',
      reportedAt: '2024-01-14T20:15:00Z',
      category: 'maintenance'
    },
    {
      id: '3',
      title: 'Noise Complaint - Late Night',
      description: 'Loud music and shouting from apartment B-205 after midnight',
      priority: 'low',
      status: 'resolved',
      location: 'Block B - Apartment 205',
      reportedAt: '2024-01-13T01:45:00Z',
      category: 'noise_complaint'
    }
  ]);

  const [showReportForm, setShowReportForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    location: '',
    category: '',
    contactMethod: 'app'
  });

  const handleSubmitReport = (e) => {
    e.preventDefault();
    const newReport = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      reportedAt: new Date().toISOString()
    };
    
    setReports([newReport, ...reports]);
    setFormData({
      title: '',
      description: '',
      priority: '',
      location: '',
      category: '',
      contactMethod: 'app'
    });
    setShowReportForm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'in_progress': return <AlertTriangleIcon className="w-4 h-4" />;
      case 'resolved': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <XCircleIcon className="w-4 h-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || report.status === statusFilter;
    const matchesPriority = !priorityFilter || report.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const categories = [
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'theft', label: 'Theft/Break-in' },
    { value: 'vandalism', label: 'Vandalism' },
    { value: 'noise_complaint', label: 'Noise Complaint' },
    { value: 'maintenance', label: 'Security Maintenance' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'other', label: 'Other' }
  ];

  const locations = [
    'Main Entrance',
    'Block A - Parking Lot',
    'Block A - Lobby',
    'Block B - Parking Lot',
    'Block B - Lobby',
    'Swimming Pool Area',
    'Gym/Recreation Area',
    'Garden/Common Area',
    'Rooftop',
    'Other'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-6 shadow-soft border-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-soft">
              <AlertTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-neutral-800">
                Security Reports
              </h2>
              <p className="text-neutral-600">Report security concerns and track their status</p>
            </div>
          </div>
          <Button
            onClick={() => setShowReportForm(true)}
            className="button-primary px-6 py-3 rounded-xl font-semibold"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Report Issue
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Reports</p>
                <p className="text-2xl font-bold text-neutral-800">{reports.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <AlertTriangleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Pending</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">In Progress</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {reports.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <AlertTriangleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Resolved</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern w-full pl-12"
              />
            </div>
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-modern min-w-[150px]"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="input-modern min-w-[150px]"
              >
                <option value="">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Form */}
      {showReportForm && (
        <Card className="glass-effect rounded-2xl shadow-soft border-0 animate-slide-down">
          <CardHeader>
            <h3 className="text-xl font-bold font-display text-neutral-800">Report Security Issue</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReport} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-modern w-full"
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-modern w-full"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Priority Level *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-modern w-full"
                    required
                  >
                    <option value="">Select Priority</option>
                    <option value="high">High - Immediate attention needed</option>
                    <option value="medium">Medium - Should be addressed soon</option>
                    <option value="low">Low - Can be addressed when convenient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Location *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-modern w-full"
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-modern w-full h-32 resize-none"
                  placeholder="Please provide as much detail as possible about the security issue..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Preferred Contact Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="app"
                      checked={formData.contactMethod === 'app'}
                      onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                      className="text-primary-600"
                    />
                    <span className="text-sm">App Notification</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="phone"
                      checked={formData.contactMethod === 'phone'}
                      onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                      className="text-primary-600"
                    />
                    <span className="text-sm">Phone Call</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="email"
                      checked={formData.contactMethod === 'email'}
                      onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                      className="text-primary-600"
                    />
                    <span className="text-sm">Email</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="button-primary px-6 py-3 rounded-xl font-semibold">
                  Submit Report
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowReportForm(false)}
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

      {/* Reports Table */}
      <Card className="table-modern">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="table-header">
              <TableRow>
                <TableHead className="text-center font-semibold">Title</TableHead>
                <TableHead className="text-center font-semibold">Category</TableHead>
                <TableHead className="text-center font-semibold">Priority</TableHead>
                <TableHead className="text-center font-semibold">Location</TableHead>
                <TableHead className="text-center font-semibold">Status</TableHead>
                <TableHead className="text-center font-semibold">Reported</TableHead>
                <TableHead className="text-center font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report, index) => (
                <TableRow key={report.id} className="table-row">
                  <TableCell className="text-center">
                    <div className="max-w-xs">
                      <p className="font-semibold text-neutral-800 truncate">{report.title}</p>
                      <p className="text-xs text-neutral-500 truncate">{report.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="status-badge bg-blue-100 text-blue-800 border-blue-200">
                      {categories.find(c => c.value === report.category)?.label || report.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`status-badge ${getPriorityColor(report.priority)}`}>
                      {report.priority?.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-neutral-600">
                    <div className="flex items-center justify-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {report.location}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(report.status)}
                      <span className={`status-badge ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-neutral-500">
                    {new Date(report.reportedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2">
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredReports.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-lg font-medium">No security reports found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};