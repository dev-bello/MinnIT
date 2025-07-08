import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Modal } from '../../ui/modal';
import { Badge } from '../../ui/badge';
import { 
  QrCodeIcon, 
  KeyIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertTriangleIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  MapPinIcon
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const ScanCodeView = () => {
  const { verifyVisitorOTP } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      setIsLoading(true);
      try {
        const result = await verifyVisitorOTP(otpString);
        
        if (result) {
          const successResult = {
            success: true,
            message: 'Visitor verified successfully!',
            visitorInfo: {
              name: result.visitor_name,
              resident: `${result.residents.name} (${result.residents.apartment_number})`,
              purpose: result.purpose,
              validUntil: new Date(result.expires_at).toLocaleString()
            }
          };
          setVerificationResult(successResult);
          
          // Add to recent verifications
          setRecentVerifications(prev => [{
            otp: otpString,
            name: result.visitor_name,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'success'
          }, ...prev.slice(0, 4)]);
        } else {
          throw new Error('Invalid OTP');
        }
      } catch (error) {
        const failResult = {
          success: false,
          message: 'Invalid OTP. Please check and try again.'
        };
        setVerificationResult(failResult);
        
        // Add to recent verifications
        setRecentVerifications(prev => [{
          otp: otpString,
          name: 'Unknown',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'failed'
        }, ...prev.slice(0, 4)]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setVerificationResult(null);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-bold font-display gradient-text">
        Visitor Verification
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual OTP Entry */}
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader className="text-center">
            <KeyIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-neutral-800 font-display">
              Manual OTP Entry
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Ask the visitor for their 6-digit verification code
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-1 sm:gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold bg-white border-2 border-neutral-300 rounded-md text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={1}
                />
              ))}
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={!isOtpComplete || isLoading}
              className="button-primary mobile-full disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Visitor'
              )}
            </Button>

            {isOtpComplete && (
              <Button
                onClick={resetOtp}
                variant="outline"
                className="w-full"
              >
                Clear & Reset
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Verifications */}
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader>
            <h3 className="text-lg font-semibold text-neutral-800 font-display">
              Recent Verifications
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Last 5 verification attempts
            </p>
          </CardHeader>
          <CardContent>
            {recentVerifications.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <QrCodeIcon className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                <p className="text-sm">No recent verifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentVerifications.map((verification, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      verification.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {verification.status === 'success' ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-mono text-sm">{verification.otp}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-neutral-800">
                          {verification.name}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {verification.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification Result Modal */}
      {verificationResult && (
        <Modal
          isOpen={!!verificationResult}
          onClose={() => setVerificationResult(null)}
          size="md"
          title={verificationResult.success ? "Verification Successful" : "Verification Failed"}
        >
          <div className="text-center space-y-4">
            {verificationResult.success ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">
                  Visitor Verified Successfully!
                </h3>
                <p className="text-sm text-green-700">
                  {verificationResult.message}
                </p>
                
                {/* Visitor Information */}
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Visitor: {verificationResult.visitorInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Resident: {verificationResult.visitorInfo.resident}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Valid until: {verificationResult.visitorInfo.validUntil}</span>
                  </div>
                  <div className="text-sm text-green-700">
                    Purpose: {verificationResult.visitorInfo.purpose}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircleIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-800">
                  Verification Failed
                </h3>
                <p className="text-sm text-red-700">
                  {verificationResult.message}
                </p>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangleIcon className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">
                      Please verify the OTP code with the visitor and try again.
                    </span>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setVerificationResult(null)}
                className="flex-1"
              >
                {verificationResult.success ? 'Continue' : 'Try Again'}
              </Button>
              {verificationResult.success && (
                <Button
                  onClick={() => {
                    setVerificationResult(null);
                    resetOtp();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Verify Another
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};