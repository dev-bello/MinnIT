import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { UserPlusIcon, SendIcon, CheckCircleIcon } from 'lucide-react';

export const InviteVisitorView = () => {
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhone: '',
    visitDate: '',
    visitTime: '',
    purpose: '',
  });
  const [inviteSent, setInviteSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const generateVisitorCode = () => {
    const codes = ['VIS003', 'VIS004', 'VIS005', 'VIS006'];
    return codes[Math.floor(Math.random() * codes.length)];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate visitor code
    const code = generateVisitorCode();
    setGeneratedCode(code);
    
    // Simulate sending invite
    setTimeout(() => {
      setInviteSent(true);
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      visitorName: '',
      visitorPhone: '',
      visitDate: '',
      visitTime: '',
      purpose: '',
    });
    setInviteSent(false);
    setGeneratedCode('');
  };

  if (inviteSent) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-xl sm:text-2xl font-bold font-display gradient-text">
          Visitor Invitation Sent
        </h2>

        <Card className="bg-green-50 border-2 border-green-500 max-w-md mx-auto">
          <CardContent className="p-4 sm:p-6 text-center">
            <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2">
              Invitation Sent Successfully!
            </h3>
            <p className="text-sm sm:text-base text-green-700 mb-4">
              Your visitor has been sent an invitation with the following details:
            </p>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border mb-4">
              <div className="space-y-2 text-xs sm:text-sm text-left">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Visitor:</span>
                  <span className="text-gray-800 truncate ml-2">{formData.visitorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="text-gray-800 truncate ml-2">{formData.visitorPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Date:</span>
                  <span className="text-gray-800">{formData.visitDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Time:</span>
                  <span className="text-gray-800">{formData.visitTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Code:</span>
                  <span className="text-gray-800 font-mono font-bold">{generatedCode}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
              <p className="text-blue-800 text-xs sm:text-sm">
                <strong>Note:</strong> The visitor will receive an SMS/Email with their unique visitor code and QR code for entry.
              </p>
            </div>

            <Button
              onClick={resetForm}
              className="button-primary mobile-full"
            >
              Send Another Invitation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-bold font-display gradient-text">
        Invite Visitor
      </h2>

      <Card className="glass-effect rounded-2xl shadow-soft border-0 max-w-2xl mx-auto">
        <CardHeader className="text-center p-4 sm:p-6">
          <UserPlusIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 mx-auto mb-2" />
          <h3 className="text-lg sm:text-xl font-semibold text-neutral-800 font-display">
            Send Visitor Invitation
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600">
            Fill out the form below to send an invitation to your visitor
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Visitor Name *
                </label>
                <input
                  type="text"
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  className="input-modern w-full"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Visitor Phone *
                </label>
                <input
                  type="tel"
                  value={formData.visitorPhone}
                  onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
                  className="input-modern w-full"
                  placeholder="+1234567890"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Visit Date *
                </label>
                <input
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  className="input-modern w-full"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Visit Time *
                </label>
                <input
                  type="time"
                  value={formData.visitTime}
                  onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                  className="input-modern w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Purpose of Visit *
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="input-modern w-full"
                required
              >
                <option value="">Select purpose</option>
                <option value="Personal Visit">Personal Visit</option>
                <option value="Business Meeting">Business Meeting</option>
                <option value="Delivery">Delivery</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Family Visit">Family Visit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Button
              type="submit"
              className="button-primary mobile-full"
            >
              <SendIcon className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-800 font-display">
            How It Works
          </h3>
        </CardHeader>
        <CardContent>
          <ul className="text-neutral-600 space-y-2 text-sm">
            <li>• Fill out the visitor information form above</li>
            <li>• Your visitor will receive an SMS/Email with their unique visitor code</li>
            <li>• The message will include a QR code for easy entry</li>
            <li>• Guards can scan the QR code or manually enter the visitor code</li>
            <li>• The invitation is valid only for the specified date and time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};