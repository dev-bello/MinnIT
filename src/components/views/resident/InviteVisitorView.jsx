import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { UserPlusIcon, SendIcon, CheckCircleIcon } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const InviteVisitorView = () => {
  const { inviteVisitor } = useAuth();
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    visitor_email: '',
    visit_date: '',
    visit_time: '',
    purpose: '',
  });
  const [inviteSent, setInviteSent] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const invite = await inviteVisitor(formData);
      setGeneratedInvite(invite);
      setInviteSent(true);
    } catch (error) {
      console.error('Error creating invite:', error);
      alert('Error creating visitor invite. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      visitor_name: '',
      visitor_phone: '',
      visitor_email: '',
      visit_date: '',
      visit_time: '',
      purpose: '',
    });
    setInviteSent(false);
    setGeneratedInvite(null);
  };

  if (inviteSent && generatedInvite) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-xl sm:text-2xl font-bold font-display gradient-text">
          Visitor Invitation Sent
        </h2>

        <Card className="bg-green-50 border-2 border-green-500 max-w-md mx-auto">
          <CardContent className="p-4 sm:p-6 text-center">
            <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2">
              Invitation Created Successfully!
            </h3>
            <p className="text-sm sm:text-base text-green-700 mb-4">
              Your visitor has been registered with the following details:
            </p>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border mb-4">
              <div className="space-y-2 text-xs sm:text-sm text-left">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Visitor:</span>
                  <span className="text-gray-800 truncate ml-2">{generatedInvite.visitor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="text-gray-800 truncate ml-2">{generatedInvite.visitor_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Date:</span>
                  <span className="text-gray-800">{generatedInvite.visit_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Time:</span>
                  <span className="text-gray-800">{generatedInvite.visit_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">OTP Code:</span>
                  <span className="text-gray-800 font-mono font-bold text-lg">{generatedInvite.otp_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Invite ID:</span>
                  <span className="text-gray-800 font-mono">{generatedInvite.unique_id}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
              <p className="text-blue-800 text-xs sm:text-sm">
                <strong>Important:</strong> Share the OTP code ({generatedInvite.otp_code}) with your visitor. 
                They will need this code to gain entry at the gate.
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
            Create Visitor Invitation
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600">
            Fill out the form below to register your visitor
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
                  value={formData.visitor_name}
                  onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
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
                  value={formData.visitor_phone}
                  onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                  className="input-modern w-full"
                  placeholder="+234 xxx xxx xxxx"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Visitor Email (Optional)
              </label>
              <input
                type="email"
                value={formData.visitor_email}
                onChange={(e) => setFormData({ ...formData, visitor_email: e.target.value })}
                className="input-modern w-full"
                placeholder="visitor@email.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Visit Date *
                </label>
                <input
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
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
                  value={formData.visit_time}
                  onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
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
              disabled={isLoading}
              className="button-primary mobile-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Invitation...</span>
                </div>
              ) : (
                <>
                  <SendIcon className="w-4 h-4 mr-2" />
                  Create Invitation
                </>
              )}
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
            <li>• The system will generate a unique OTP code for your visitor</li>
            <li>• Share the OTP code with your visitor via phone or message</li>
            <li>• Guards can verify the visitor using the OTP code at the gate</li>
            <li>• The invitation is valid only for the specified date and time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};