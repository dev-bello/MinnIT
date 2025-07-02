import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { KeyIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export const VerifyOTPView = () => {
  const { verifyVisitorOTP } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentVerifications, setRecentVerifications] = useState([]);

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
            message: 'OTP verified successfully!',
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
        OTP Verification
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader className="text-center">
            <KeyIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-neutral-800 font-display">
              Enter 6-Digit OTP
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
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify OTP'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Verifications */}
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader>
            <h3 className="text-lg font-semibold text-neutral-800 font-display">
              Recent Verifications
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentVerifications.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <KeyIcon className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  <p className="text-sm">No verifications yet</p>
                </div>
              ) : (
                recentVerifications.map((verification, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        verification.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <p className="text-neutral-800 font-medium font-mono text-sm">{verification.otp}</p>
                        <p className="text-neutral-600 text-xs">{verification.name}</p>
                      </div>
                    </div>
                    <div className="text-neutral-600 text-xs sm:text-sm">{verification.time}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <Card className={`border-2 ${verificationResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} animate-slide-down`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              {verificationResult.success ? (
                <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              ) : (
                <XCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              )}
              <h3 className={`text-base sm:text-lg font-semibold ${verificationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {verificationResult.message}
              </h3>
            </div>

            {verificationResult.success && verificationResult.visitorInfo && (
              <div className="bg-white p-3 sm:p-4 rounded-lg border mb-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Visitor Information:</h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="text-gray-800">{verificationResult.visitorInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Visiting:</span>
                    <span className="text-gray-800">{verificationResult.visitorInfo.resident}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Purpose:</span>
                    <span className="text-gray-800">{verificationResult.visitorInfo.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Valid Until:</span>
                    <span className="text-gray-800">{verificationResult.visitorInfo.validUntil}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={resetOtp}
              className="button-primary mobile-full"
            >
              Verify Another OTP
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-800 font-display">
            Instructions
          </h3>
        </CardHeader>
        <CardContent>
          <ul className="text-neutral-600 space-y-2 text-xs sm:text-sm">
            <li>• Ask the visitor to provide their 6-digit OTP code</li>
            <li>• Enter each digit in the corresponding box</li>
            <li>• The system will automatically verify the code</li>
            <li>• Valid OTPs will show visitor information and visiting details</li>
            <li>• Contact the admin if you encounter any issues</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};